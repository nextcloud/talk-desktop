/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { shell } = require('electron')
const { DEV_SERVER_ORIGIN } = require('../constants.js')

/**
 * A link is internal, if it is file:// link or devServer's origin on non-production
 *
 * @param {string} url - URL
 * @return {boolean}
 */
function isInternalLink(url) {
	return url.startsWith('file') || (process.env.NODE_ENV !== 'production' && url.startsWith(DEV_SERVER_ORIGIN))
}

/**
 * A link is external, if it not file:// link and not devServer's origin on non-production
 *
 * @param {string} url - URL
 * @return {boolean}
 */
function isExternalLink(url) {
	return !isInternalLink(url)
}

/**
 * Open external link in the default OS handler (i.e. Web-Browser) on new window open
 *
 * @param {import('electron').HandlerDetails} details - HandlerDetails
 * @param {import('electron').BrowserWindowConstructorOptions} [browserWindowOptions] - options for new BrowserWindow, usually based on parent options
 * @return {{action: 'deny'} | {action: 'allow', outlivesOpener?: boolean, overrideBrowserWindowOptions?: import('electron').BrowserWindowConstructorOptions}}
 */
function windowOpenExternalLinkHandler(details, browserWindowOptions = {}) {
	if (isExternalLink(details.url)) {
		shell.openExternal(details.url)
		return { action: 'deny' }
	}
	return {
		action: 'allow',
		overrideBrowserWindowOptions: browserWindowOptions,
	}
}

/**
 * Open external link in the default OS handler (i.e. Web-Browser) on navigate
 *
 * @param {import('electron').Event} event - Will Navigate Electron Event
 * @param {string} url - URL
 */
function willNavigateExternalLinkHandler(event, url) {
	if (isExternalLink(url)) {
		event.preventDefault()
		shell.openExternal(url)
	}
}

/**
 * Apply external links handling at BrowserWindow
 *
 * @param {import('electron').BrowserWindow} browserWindow - Browser window
 * @param {import('electron').BrowserWindowConstructorOptions} [browserWindowOptions] - options for new BrowserWindow, usually based on parent options
 */
function applyExternalLinkHandler(browserWindow, browserWindowOptions = {}) {
	browserWindow.webContents.on('will-navigate', willNavigateExternalLinkHandler)
	browserWindow.webContents.setWindowOpenHandler((details) => windowOpenExternalLinkHandler(details, browserWindowOptions))
}

module.exports = {
	isInternalLink,
	isExternalLink,
	applyExternalLinkHandler,
}
