/*
 * @copyright Copyright (c) 2023 Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
 *
 * @author Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
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
