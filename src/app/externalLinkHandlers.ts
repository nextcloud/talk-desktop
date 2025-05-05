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
import { appData } from './AppData.js'
import { isExternalUrl } from './utils.ts'

const talkPathRe = new RegExp('^/apps/spreed(?:/(?:not-found|forbidden|duplicate-session))?|/call/[^/]+$')

/**
 * Try to extract Talk route from the link
 *
 * @param link - URL link
 */
function tryExtractTalkRoute(link: string) {
	const url = new URL(link)

	// Not a link to this instance
	if (!appData.serverUrl || url.origin !== appData.serverUrl) {
		return null
	}

	// Path without /index.php
	const pathname = url.pathname.slice(url.pathname.startsWith('/index.php') ? '/index.php'.length : 0)

	// Check whether the path is a valid Talk path or some other app
	if (!talkPathRe.test(pathname)) {
		return null
	}

	// Built app's fullPath
	return pathname + url.search + url.hash
}

/**
 * Apply external links handling at BrowserWindow
 *
 * @param browserWindow - Browser window
 * @param browserWindowOptions - options for new BrowserWindow, usually based on parent options
 */
export function applyExternalLinkHandler(browserWindow: BrowserWindow, browserWindowOptions: Partial<BrowserWindowConstructorOptions> = {}) {
	browserWindow.webContents.on('will-navigate', willNavigateExternalLinkHandler)
	browserWindow.webContents.setWindowOpenHandler((details) => windowOpenExternalLinkHandler(details, browserWindowOptions))
}

/**
 * Handle new window open
 *
 * @param details - HandlerDetails
 * @param browserWindowOptions - Options for new BrowserWindow, usually based on parent options
 */
function windowOpenExternalLinkHandler(details: HandlerDetails, browserWindowOptions: BrowserWindowConstructorOptions = {}): WindowOpenHandlerResponse {
	// Open external links in the default web-browser instead of a new app window
	if (isExternalUrl(details.url)) {
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
 *
 * @param event - Will Navigate Electron Event
 */
async function willNavigateExternalLinkHandler(event: Event<WebContentsWillNavigateEventParams>) {
	const { url, initiator: webFrameMain } = event

	// Internal navigation - do nothing
	if (!isExternalUrl(url)) {
		if (process.env.NODE_ENV === 'production') {
			console.warn('Unexpected internal navigation to URL:', url)
		}
		return
	}

	// Prevent opening a web-page in the window
	event.preventDefault()

	const talkRoute = tryExtractTalkRoute(url)
	if (talkRoute && webFrameMain) {
		// Talk route is about to open - navigate in app internally instead
		// TODO: is it better to use browserWindow API here?
		await webFrameMain.executeJavaScript(`window.location.hash = '#${talkRoute}'`)
		webFrameMain.reload()
		return
	}

	// External link - open in the default browser
	await shell.openExternal(url)
}
