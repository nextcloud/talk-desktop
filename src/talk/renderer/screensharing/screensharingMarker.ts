/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { ScreensharingSource } from '../../../screensharing/screensharing.types.ts'

/** The source the user has selected in the screen sharing dialog */
let selectedSource: ScreensharingSource | null = null

/**
 * Remember the source the user is about to share.
 *
 * The selected source is only known here, while the screen sharing itself is managed by Talk.
 *
 * @param source - The selected source
 */
export function setSelectedScreensharingSource(source: ScreensharingSource) {
	selectedSource = source
}

/**
 * Mark the shared screens as being shared as long as a screen is shared in a call
 */
export async function useScreensharingMarkerIntegration() {
	// Imported dynamically: Talk media models are only available when Talk is initialized
	const { localMediaModel } = await import('@talk/src/utils/webrtc/index.js')

	// Note: the reactive state of the model cannot be watched from here.
	// Talk Desktop and Talk have their own Vue instances and thus separate reactivity systems,
	// so a watcher created here is never triggered by a change made by Talk.
	// The model emits an event on every change, which works across both.
	localMediaModel.on('change:localScreen', (model: unknown, localScreen: MediaStream | null) => {
		// Talk calls the handler synchronously while starting the screen sharing.
		// An error here must never break the sharing itself.
		try {
			if (localScreen && selectedSource) {
				// Only plain data can be passed to the main process,
				// while the selected source is a reactive object of the dialog
				window.TALK_DESKTOP.showScreensharingMarker({
					id: selectedSource.id,
					display_id: selectedSource.display_id,
				})
			} else {
				window.TALK_DESKTOP.hideScreensharingMarker()
			}
		} catch (error) {
			console.error('Failed to update the screen sharing marker', error)
		}
	})
}
