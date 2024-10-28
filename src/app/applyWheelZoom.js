/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { BrowserWindow } from 'electron'
import { onAppConfigChange, setAppConfig } from './AppConfig.ts'
import { ZOOM_MAX, ZOOM_MIN, TITLE_BAR_HEIGHT } from '../constants.js'

/**
 * Electron zoom level factor. scale factor is 1.2 ** level
 * @type {number}
 */
const ELECTRON_ZOOM_LEVEL_FACTOR = 1.2

/**
 * Default Electron zoom level change on hotkey - 0.5 level
 * @type {number}
 */
const ZOOM_STEP_FACTOR = Math.pow(ELECTRON_ZOOM_LEVEL_FACTOR, 0.5)

/**
 * Set zoom factor for a browser window
 * @param {import('electron').BrowserWindow} browserWindow - Browser window
 * @param {number} zoom - Zoom factor
 */
export function setZoom(browserWindow, zoom) {
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
 * @param {import('electron').BrowserWindow} browserWindow - Browser window
 */
export function increaseZoom(browserWindow) {
	setZoom(browserWindow, browserWindow.webContents.getZoomFactor() * ZOOM_STEP_FACTOR)
}

/**
 * Decrease zoom level
 * @param {import('electron').BrowserWindow} browserWindow - Browser window
 */
export function decreaseZoom(browserWindow) {
	setZoom(browserWindow, browserWindow.webContents.getZoomFactor() / ZOOM_STEP_FACTOR)
}

/**
 * Enable zooming a window by mouse wheel
 *
 * @param {import('electron').BrowserWindow} browserWindow - Browser window
 */
export function applyWheelZoom(browserWindow) {
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
