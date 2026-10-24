/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { BrowserWindow, Display, WebContents } from 'electron'
import type { SharedScreensharingSource } from './screensharing.types.ts'

import { screen } from 'electron'
import { getAppConfig, onAppConfigChange } from '../app/AppConfig.ts'
import { isWayland, isWindows } from '../app/system.utils.ts'
import { createScreensharingMarkerWindow } from './screensharingMarker.window.ts'

/** The source that is currently being shared, if any */
let sharedSource: SharedScreensharingSource | null = null
/** The web contents that is sharing the source */
let sharedSourceOwner: WebContents | null = null
/** Marker windows by the ID of the marked display */
const markerWindows = new Map<number, BrowserWindow>()
/** Whether the displays are observed for changes */
let hasDisplayListeners = false

/**
 * Mark every screen captured by the shared source as being shared.
 * The marker of a previously shared source is removed.
 *
 * @param source - The shared source
 * @param owner - The web contents sharing the source
 */
export function showScreensharingMarker(source: SharedScreensharingSource, owner: WebContents) {
	sharedSource = source

	// The owner cannot ask to remove the marker if it is gone, for example, on a window relaunch
	if (sharedSourceOwner !== owner) {
		sharedSourceOwner = owner
		owner.once('destroyed', () => hideScreensharingMarker())
	}

	renderScreensharingMarker()
}

/**
 * Remove the marker from all the marked screens
 */
export function hideScreensharingMarker() {
	sharedSource = null
	renderScreensharingMarker()
}

/**
 * Get the displays captured by the shared source.
 *
 * Only entire screens are marked. There is nothing to mark for a single application window:
 * it is clear for the user which window is shared, and marking the entire screen would be misleading.
 *
 * @param source - The shared source
 */
function getSharedDisplays(source: SharedScreensharingSource): Display[] {
	const displays = screen.getAllDisplays()

	// A custom sourceId for capturing all the screens at once - all of them are shared
	if (source.id === 'entire-desktop:0:0') {
		return displays
	}

	if (!source.id.startsWith('screen:')) {
		return []
	}

	// desktopCapturer provides the ID of the display for a screen source.
	// As a fallback, it is the first part of the screen sourceId, which is "screen:{displayId}:{index}"
	const displayId = source.display_id || source.id.split(':')[1]
	const display = displays.find((display) => String(display.id) === displayId)

	if (display) {
		return [display]
	}

	// The display could not be matched, which is not supposed to happen.
	// With a single display there is still no ambiguity about what is shared.
	return displays.length === 1 ? displays : []
}

/**
 * Create, move and remove the marker windows to match the currently shared source
 */
function renderScreensharingMarker() {
	// On Wayland the compositor doesn't allow an application to position its windows,
	// so an overlay cannot be placed over the shared screen.
	// On Windows content protection doesn't exclude the overlay from the captured screen,
	// so the other participants would see it.
	const isMarkerEnabled = !isWayland && !isWindows && getAppConfig('screensharingMarker')
	const displays = sharedSource && isMarkerEnabled ? getSharedDisplays(sharedSource) : []
	const sharedDisplayIds = new Set(displays.map((display) => display.id))

	for (const [displayId, window] of markerWindows) {
		if (!sharedDisplayIds.has(displayId)) {
			window.destroy()
			markerWindows.delete(displayId)
		}
	}

	for (const display of displays) {
		const window = markerWindows.get(display.id)
		if (window) {
			// The display might have been moved or resized
			window.setBounds(display.bounds)
		} else {
			markerWindows.set(display.id, createScreensharingMarkerWindow(display))
		}
	}

	observeDisplays(markerWindows.size > 0)
}

/**
 * Follow the displays configuration while there is anything marked
 *
 * @param shouldObserve - Whether the displays must be observed
 */
function observeDisplays(shouldObserve: boolean) {
	if (shouldObserve === hasDisplayListeners) {
		return
	}
	hasDisplayListeners = shouldObserve

	if (shouldObserve) {
		screen.on('display-added', renderScreensharingMarker)
		screen.on('display-metrics-changed', renderScreensharingMarker)
		screen.on('display-removed', renderScreensharingMarker)
	} else {
		screen.off('display-added', renderScreensharingMarker)
		screen.off('display-metrics-changed', renderScreensharingMarker)
		screen.off('display-removed', renderScreensharingMarker)
	}
}

// Applying the setting immediately is important to be able to get rid of the marker during a call
onAppConfigChange('screensharingMarker', () => renderScreensharingMarker())
