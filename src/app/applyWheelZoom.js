/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Enable zooming window by mouse wheel
 *
 * @param {import('electron').BrowserWindow} browserWindow - Browser window
 */
export function applyWheelZoom(browserWindow) {
	browserWindow.webContents.on('zoom-changed', (event, zoomDirection) => {
		const zoom = browserWindow.webContents.getZoomLevel()
		// 0.5 level delta seems to be equivalent of "CTRL+" (zoomIn) and CTRL- (zoomOut) commands
		const zoomDelta = 0.5 * (zoomDirection === 'in' ? 1 : -1)
		const newZoom = zoom + zoomDelta
		// Undocumented default limits for zoom level is [-8, 9] or [~23.25%, 515.97%]
		if (newZoom >= -8 && newZoom <= 9) {
			browserWindow.webContents.setZoomLevel(zoom + zoomDelta)
		}
	})
}
