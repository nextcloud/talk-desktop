/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { session } = require('electron')
const { osTitle } = require('./system.utils.ts')
const packageJson = require('../../package.json')
const { APP_PROTOCOL } = require('../constants.js')

const USER_AGENT = `Mozilla/5.0 (${osTitle}) Nextcloud-Talk v${packageJson.version}`

/**
 * Patch requests on the default session to a specific Nextcloud server for Cookies or CORS.
 *
 * @param {string} serverUrl - Nextcloud server URL
 * @param {object} [options] - Patching options
 * @param {import('../accounts/login.service.js').Credentials} [options.credentials] - User credentials for the Authentication header
 */
function enableWebRequestInterceptor(serverUrl, {
	credentials = null,
} = {}) {
	/**
	 * Note: this function affects ALL requests. Performance is important here.
	 */

	// Cleanup because Electron doesn't support an interceptor update...
	disableWebRequestInterceptor()

	/** @type {import('electron').WebRequestFilter} */
	const filter = {
		urls: [`${serverUrl}/*`],
	}

	session.defaultSession.webRequest.onBeforeRequest({
		urls: [`${serverUrl}/*`, `${APP_PROTOCOL}://api/*`],
	}, (details, callback) => {
		// Make sure redirect request is to the current server
		if (details.url.startsWith(`${APP_PROTOCOL}://api/`)) {
			const redirectUrl = details.url.slice(`${APP_PROTOCOL}://api/`.length)
			return callback({ cancel: !redirectUrl.startsWith(serverUrl) })
		}

		// Redirect to the internal reverse proxy
		if (details.webContents) {
			return callback({ redirectURL: APP_PROTOCOL + '://api/' + details.url })
		}

		callback({})
	})

	session.defaultSession.webRequest.onBeforeSendHeaders(
		filter,
		(details, callback) => {
			details.requestHeaders.Origin = new URL(serverUrl).origin
			details.requestHeaders['User-Agent'] = USER_AGENT
			details.requestHeaders['OCS-APIRequest'] = 'true'
			if (credentials) {
				details.requestHeaders.Authorization = `Basic ${btoa(`${credentials.user}:${credentials.password}`)}`
			}
			callback(details)
		},
	)
}

/**
 * Disable any request patching on the default session
 */
function disableWebRequestInterceptor() {
	session.defaultSession.webRequest.onBeforeSendHeaders(null)
}

module.exports = {
	enableWebRequestInterceptor,
	disableWebRequestInterceptor,
}
