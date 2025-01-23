/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {
	BrowserWindow,
	BrowserWindowConstructorOptions,
	Event,
	HandlerDetails,
	WebContentsWillNavigateEventParams,
	WindowOpenHandlerResponse,
} from 'electron'
import { shell } from 'electron'
import { DEV_SERVER_ORIGIN } from '../constants.js'

/**
 * Check if a link is an internal application link
 * @param url - URL
 */
export function isInternalLink(url: string) {
	return url.startsWith('file') || (process.env.NODE_ENV !== 'production' && url.startsWith(DEV_SERVER_ORIGIN))
}

/**
 * Check if a link is external
 * @param url - URL
 */
export function isExternalLink(url: string) {
	return !isInternalLink(url)
}

/**
 * Apply external links handling at BrowserWindow
 * @param browserWindow - Browser window
 * @param browserWindowOptions - options for new BrowserWindow, usually based on parent options
 */
export function applyExternalLinkHandler(browserWindow: BrowserWindow, browserWindowOptions: Partial<BrowserWindowConstructorOptions> = {}) {
	browserWindow.webContents.on('will-navigate', willNavigateExternalLinkHandler)
	browserWindow.webContents.setWindowOpenHandler((details) => windowOpenExternalLinkHandler(details, browserWindowOptions))
}

/**
 * Handle new window open
 * @param details - HandlerDetails
 * @param browserWindowOptions - Options for new BrowserWindow, usually based on parent options
 */
function windowOpenExternalLinkHandler(details: HandlerDetails, browserWindowOptions: BrowserWindowConstructorOptions = {}): WindowOpenHandlerResponse {
	// Open external links in the default web-browser instead of a new app window
	if (isExternalLink(details.url)) {
		shell.openExternal(details.url)
		return { action: 'deny' }
	}
	// Open apps link as a new window
	// TODO: instead of native open - manually create fully controlled window
	return {
		action: 'allow',
		overrideBrowserWindowOptions: browserWindowOptions,
	}
}

/**
 * Open external link in the default OS handler (i.e. Web-Browser) on navigate
 * @param event - Will Navigate Electron Event
 */
function willNavigateExternalLinkHandler(event: Event<WebContentsWillNavigateEventParams>) {
	const { url } = event

	if (isExternalLink(url)) {
		event.preventDefault()
		shell.openExternal(url)
	}
}
