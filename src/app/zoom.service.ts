/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { BrowserWindow } from 'electron'
import { TITLE_BAR_HEIGHT, ZOOM_MAX, ZOOM_MIN } from '../constants.js'
import { onAppConfigChange, setAppConfig } from './AppConfig.ts'

/**
 * Electron zoom level factor. scale factor is 1.2 ** level
 */
const ELECTRON_ZOOM_LEVEL_FACTOR = 1.2

/**
 * Default Electron zoom level change on hotkey - 0.5 level
 */
const ZOOM_STEP_FACTOR = Math.pow(ELECTRON_ZOOM_LEVEL_FACTOR, 0.5)

/**
 * Set zoom factor for a browser window
 *
 * @param browserWindow - Browser window
 * @param zoom - Zoom factor
 */
export function setZoom(browserWindow: BrowserWindow, zoom: number) {
	if (browserWindow.webContents.getZoomFactor() === zoom) {
		return
	}

	// Limit zoom level to custom title bar limits
	if (zoom < ZOOM_MIN || zoom > ZOOM_MAX) {
		return
	}

	browserWindow.webContents.setZoomFactor(zoom)
	// Resize the title bar to match the new zoom level
	try {
		browserWindow.setTitleBarOverlay({
			height: Math.round(TITLE_BAR_HEIGHT * zoom),
		})
	} catch {
		// This is fine and expected
		// when the browser window does not have a title bar overlay
	}

	setAppConfig('zoomFactor', zoom)
}

/**
 * Increase zoom level
 *
 * @param browserWindow - Browser window
 */
export function increaseZoom(browserWindow: BrowserWindow) {
	setZoom(browserWindow, browserWindow.webContents.getZoomFactor() * ZOOM_STEP_FACTOR)
}

/**
 * Decrease zoom level
 *
 * @param browserWindow - Browser window
 */
export function decreaseZoom(browserWindow: BrowserWindow) {
	setZoom(browserWindow, browserWindow.webContents.getZoomFactor() / ZOOM_STEP_FACTOR)
}

/**
 * Enable zooming a window by mouse wheel
 *
 * @param browserWindow - Browser window
 */
export function applyWheelZoom(browserWindow: BrowserWindow) {
	browserWindow.webContents.on('zoom-changed', (event, zoomDirection) => {
		if (zoomDirection === 'in') {
			increaseZoom(browserWindow)
		} else {
			decreaseZoom(browserWindow)
		}
	})
}

onAppConfigChange('zoomFactor', (value) => {
	for (const browserWindow of BrowserWindow.getAllWindows()) {
		setZoom(browserWindow, value)
	}
})
