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

/**
 * Determine title bar symbol color the same way as on the server for elements.
 * Thus make sure title bar controls and app elements have the same color,
 * Otherwise OS may decide to use dark symbols while Nextcloud theming decides to use light symbols on the same background
 *
 * @param backgroundColor - Color in hex format #RRGGBB, default is BUILD_CONFIG.backgroundColor
 */
export function getTitleBarSymbolColor(backgroundColor: string = BUILD_CONFIG.backgroundColor): string {
	return invertTextColor(backgroundColor) ? '#000000' : '#FFFFFF'

	/**
	 * Calculate the Luma according to WCAG 2
	 *
	 * @see http://www.w3.org/TR/WCAG20/#relativeluminancedef
	 * @param color - Color in hex format #RRGGBB
	 */
	function calculateLuma(color: string) {
		const rgb = color.match(/[0-9a-f]{2}/gi)?.map((part) => parseInt(part, 16) / 255) ?? [0, 0, 0]
		const [r, g, b] = rgb.map((part) => (part <= 0.03928) ? part / 12.92 : Math.pow((part + 0.055) / 1.055, 2.4))
		return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
	}

	/**
	 * Calculate the contrast between two colors according to WCAG 2
	 *
	 * @see http://www.w3.org/TR/WCAG20/#contrast-ratiodef
	 * @param colorA - Color in hex format #RRGGBB
	 * @param colorB - Color in hex format #RRGGBB
	 */
	function colorContrast(colorA: string, colorB: string) {
		const lumaA = calculateLuma(colorA) + 0.05
		const lumaB = calculateLuma(colorB) + 0.05
		return Math.max(lumaA, lumaB) / Math.min(lumaA, lumaB)
	}

	/**
	 * Should we invert the text on this background color?
	 *
	 * @see OCA\Theming\Util->invertTextColor on server
	 * @param color - Color in hex format #RRGGBB
	 */
	function invertTextColor(color: string): boolean {
		return colorContrast(color, '#ffffff') < 4.5
	}
}
