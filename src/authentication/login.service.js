/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * @typedef Credentials
 * @property {string} server - Server URL
 * @property {string} user - User's Login (user@example.com, not userid)
 * @property {string} password - App password
 */

/**
 * Parse redirect URL
 *
 * @param {string} url - Redirect URL nc://login/server:URL&user:USER&password:PASSWORD
 * @return {Credentials} - Credentials data
 * @throws {Error} - Parsing error
 */
function parseLoginRedirectUrl(url) {
	// nc://login/server:URL&user:USER&password:PASSWORD
	const re = /^nc:\/\/login\/server:(.*)&user:(.*)&password:(.*)$/
	const parsed = url.match(re)
	if (parsed.length < 4) {
		throw new Error('Error on parsing login redirect URL')
	}
	return {
		server: parsed[1],
		user: decodeURIComponent(parsed[2].replaceAll('+', ' ')),
		password: decodeURIComponent(parsed[3].replaceAll('+', ' ')),
	}
}

module.exports = {
	parseLoginRedirectUrl,
}
