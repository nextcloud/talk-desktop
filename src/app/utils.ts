/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { BrowserWindow } from 'electron'

import { screen } from 'electron'
import { APP_ORIGIN } from '../constants.js'
import { BUILD_CONFIG } from '../shared/build.config.ts'
import { getAppConfig } from './AppConfig.ts'
import { appData } from './AppData.js'

/**
 * Get the scaled window size based on the current zoom factor
 *
 * @param size - Base window size
 * @param size.width - Base window width
 * @param size.height - Base window height
 * @param limit - Limit the window size to the screen size
 */
export function getScaledWindowSize({ width, height }: { width: number, height: number }, limit = true) {
	const zoomFactor = getAppConfig('zoomFactor')

	const windowWidth = Math.round(width * zoomFactor)
	const windowHeight = Math.round(height * zoomFactor)

	if (limit) {
		const primaryDisplay = screen.getPrimaryDisplay()
		const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

		return {
			width: Math.min(windowWidth, screenWidth),
			height: Math.min(windowHeight, screenHeight),
		}
	}

	return {
		width: windowWidth,
		height: windowHeight,
	}
}

/**
 * Get the scaled window minimum size based on the current zoom factor
 *
 * @param minSize - Base window minimum size
 * @param minSize.minWidth - Base window minimum width
 * @param minSize.minHeight - Base window minimum height
 * @param limit - Limit the window size to the screen size
 */
export function getScaledWindowMinSize({ minWidth, minHeight }: { minWidth: number, minHeight: number }, limit = true) {
	const { width, height } = getScaledWindowSize({ width: minWidth, height: minHeight }, limit)
	return {
		minWidth: width,
		minHeight: height,
	}
}

/**
 * Set initial zoom on a window.
 * According to the documentation, an initial zoom factor can be set with webPreferences.zoomFactor.
 * But it is ignored when Chromium has its own zoom state or when Zoom is 100%.
 * It only applies correctly if set after the window is ready to show.
 * See: https://github.com/electron/electron/issues/10572
 *
 * @param window - Browser window
 */
export function applyZoom(window: BrowserWindow) {
	const zoomFactor = getAppConfig('zoomFactor')
	window.once('ready-to-show', () => {
		window.webContents.setZoomFactor(zoomFactor)
	})
}

/**
 * Build a title for the window from base (product name) and release channel
 *
 * @param title - the title of the window
 */
export function buildTitle(title?: string) {
	const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
	const BASE_TITLE = BUILD_CONFIG.applicationName
	const base = __CHANNEL__ !== 'stable' ? `${BASE_TITLE} ${capitalize(__CHANNEL__)}` : BASE_TITLE
	return title ? `${title} - ${base}` : base
}

const windows = ['authentication', 'callbox', 'certificate', 'help', 'talk', 'upgrade', 'welcome'] as const

/**
 * Get the URL for a window to load
 *
 * @param window - Window name
 */
export function getWindowUrl(window: typeof windows[number]) {
	if (!windows.includes(window)) {
		throw new Error(`Invalid window name: ${window}`)
	}

	const origin = appData.serverUrl ? new URL(appData.serverUrl).origin : APP_ORIGIN
	return `${origin}/talk_desktop__window_${window}/index.html`
}

/**
 * Check weather a link is an internal application link
 *
 * @param url - URL
 */
export function isInternalUrl(url: string | URL) {
	if (typeof url === 'string') {
		url = new URL(url)
	}

	const internalOrigin = appData.serverUrl ? new URL(appData.serverUrl).origin : APP_ORIGIN

	return url.origin === internalOrigin && url.pathname.startsWith('/talk_desktop__')
}

/**
 * Check whether a link is not an internal application link
 *
 * @param url - URL
 */
export function isExternalUrl(url: string | URL) {
	return !isInternalUrl(url)
}
