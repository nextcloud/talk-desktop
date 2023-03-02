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

const { session } = require('electron')
const { USER_AGENT, DEV_SERVER_ORIGIN } = require('../constants.js')

/**
 * Patch requests on the default session to a specific Nextcloud server for Cookies or CORS.
 *
 * @param {string} serverUrl - Nextcloud server URL
 * @param {boolean=false} enableCors - Enable CORS for OCS and other APIs
 * @param {boolean=false} enableCookies - Enable aka cross-origin cookie without setting SameSate=None.
 * 																				Some Talk and Files API requests require cookie session.
 */
function enableWebRequestInterceptor(serverUrl, {
	enableCors = false,
	enableCookies = false,
}) {
	/**
	 * Note: this function affects ALL requests. Performance is important here.
	 */

	/**
	 * CookieStorage. There are not many cookies (2-3). POJO is faster, than a Map.
	 * @type {Object<string,string>}
	 */
	const cookiesStorage = {}

	/**
	 * @param {import('electron').OnBeforeSendHeadersListenerDetails} details
	 */
	function includeCookies(details) {
		details.requestHeaders['Cookie'] = Object.entries(cookiesStorage).map(([cookieName, cookieValue]) => `${cookieName}=${cookieValue}`).join('; ')
	}

	/**
	 * @param {import('electron').OnHeadersReceivedListenerDetails} details
	 */
	function persistCookies(details) {
		// OPTIONS will have new session - ignore
		if (details.method !== 'OPTIONS' && details.responseHeaders['set-cookie']) {
			for (const cookie of details.responseHeaders['set-cookie']) {
				const [name, value] = cookie.split('=')
				cookiesStorage[name] = value.split(';')[0]
			}
			delete details.responseHeaders['set-cookie']
		}
	}

	const ALLOWED_ORIGIN = [process.env.NODE_ENV === 'production' ? 'file://' : `${DEV_SERVER_ORIGIN}`]
	const ALLOWED_METHODS = ['GET, POST, PUT, PATCH, DELETE']
	const ALLOWED_CREDENTIALS_TRUE = ['true']
	const ALLOWED_HEADERS = [[
		// Common headers
		'Authorization',
		'OCS-APIRequest',
		'Content-Type',
		'Set-Cookie',
		// Nextcloud Talk custom headers
		'x-nextcloud-talk-modified-before',
		'x-nextcloud-talk-hash',
		'x-nextcloud-has-user-statuses',
		'x-chat-last-given',
		'x-chat-last-common-read',
	].join(', ')]
	const EXPOSED_HEADERS = [[
		'x-chat-last-given',
		'x-chat-last-common-read',
	].join(', ')]

	/**
	 * @param {import('electron').OnHeadersReceivedListenerDetails} details
	 */
	function addCorsHeaders(details) {
		if (details.method === 'OPTIONS') {
			// OPTIONS method for CORS on OCS and API is not allowed at all... Let's make a hack...
			// 405 Method Not Allowed -> 200 OK
			details.statusLine = details.statusLine.replace('405', '200')
		}
		details.responseHeaders['Access-Control-Allow-Origin'] = ALLOWED_ORIGIN
		details.responseHeaders['Access-Control-Allow-Credentials'] = ALLOWED_CREDENTIALS_TRUE
		details.responseHeaders['Access-Control-Allow-Headers'] = ALLOWED_HEADERS
		details.responseHeaders['Access-Control-Expose-Headers'] = EXPOSED_HEADERS
	}

	/** @type {import('electron').WebRequestFilter} */
	const filter = {
		urls: [`${serverUrl}/*`],
	}

	// TODO: should use concrete window session instead of defaultSession ?

	session.defaultSession.webRequest.onBeforeSendHeaders(
		filter,
		(details, callback) => {
			details.requestHeaders['User-Agent'] = USER_AGENT
			if (enableCookies) {
				includeCookies(details)
			}
			callback(details)
		},
	)

	session.defaultSession.webRequest.onHeadersReceived(
		filter,
		(details, callback) => {
			if (enableCookies) {
				persistCookies(details)
			}
			if (enableCors) {
				addCorsHeaders(details)
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
	session.defaultSession.webRequest.onHeadersReceived(null)
}

module.exports = {
	enableWebRequestInterceptor,
	disableWebRequestInterceptor,
}
