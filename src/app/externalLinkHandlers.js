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

const { shell } = require('electron')
const { DEV_SERVER_ORIGIN } = require('../constants')

/**
 * A link is internal, if it is file:// link or devServer's origin on non-production
 *
 * @param {string} url
 * @return {boolean}
 */
function isInternalLink(url) {
	return url.startsWith('file') || process.env.NODE_ENV !== 'production' && url.startsWith(DEV_SERVER_ORIGIN)
}

/**
 * A link is external, if it not file:// link and not devServer's origin on non-production
 *
 * @param {string} url
 * @return {boolean}
 */
function isExternalLink(url) {
	return !isInternalLink(url)
}

/**
 * Open external link in the default OS handler (i.e. Web-Browser) on new window open
 *
 * @param {import('electron').HandlerDetails} details
 * @param {import('electron').BrowserWindowConstructorOptions} [browserWindowOptions={}] - options for new BrowserWindow, usually based on parent options
 * @return {{action: 'deny'} | {action: 'allow', outlivesOpener?: boolean, overrideBrowserWindowOptions?: import('electron').BrowserWindowConstructorOptions}}
 */
function windowOpenExternalLinkHandler(details, browserWindowOptions = {}) {
	// TODO: Should handle different types of details.disposition? I.e. save-to-disk?
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
 * @param {import('electron').Event} event
 * @param {string} url
 */
function willNavigateExternalLinkHandler(event, url) {
	if (isExternalLink(url)) {
		event.preventDefault()
		shell.openExternal(url)
	}
}

module.exports = {
	isInternalLink,
	isExternalLink,
	windowOpenExternalLinkHandler,
	willNavigateExternalLinkHandler,
}
