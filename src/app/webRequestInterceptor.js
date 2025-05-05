/*!
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { session } = require('electron')

/**
 * Patch requests on the default session to use
 *
 * @param {string} serverUrl - Nextcloud server URL
 * @param {object} [options] - Patching options
 * @param {import('../accounts/login.service.js').Credentials} [options.credentials] - User credentials for the Authentication header
 */
function enableWebRequestInterceptor(serverUrl, { credentials } = {}) {
	// Cleanup because Electron doesn't support an interceptor update
	disableWebRequestInterceptor()

	session.defaultSession.webRequest.onBeforeSendHeaders(
		{
			urls: [`${serverUrl}/*`],
			// types: ['xhr', 'image', 'media', 'webSocket', 'ping'],
		},
		(details, callback) => {
			// TODO: For performance, only add Authorization header if there is no session Cookies
			callback({
				requestHeaders: {
					...details.requestHeaders,
					Origin: new URL(serverUrl).origin,
					Authorization: `Basic ${btoa(`${credentials.user}:${credentials.password}`)}`,
					'OCS-APIRequest': 'true',
				},
			})
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
