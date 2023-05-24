/*
 * @copyright Copyright (c) 2022 Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
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
		password: parsed[3],
	}
}

module.exports = {
	parseLoginRedirectUrl,
}
