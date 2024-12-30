/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

type NcLoginRedirectURL = `nc://login/server:${string}&user:${string}&password:${string}`

type Credentials = {
	/** Server URL */
	server: string
	/** User's Login (user@example.com, not userid) */
	user: string
	/** App password */
	password: string
}

/**
 * Parse redirect URL
 *
 * @param url - Redirect URL
 * @return Credentials data
 * @throws {Error} - Parsing error
 */
export function parseLoginRedirectUrl(url: NcLoginRedirectURL): Credentials {
	// nc://login/server:URL&user:USER&password:PASSWORD
	const re = /^nc:\/\/login\/server:(.*)&user:(.*)&password:(.*)$/
	const parsed = url.match(re)
	if (!parsed || parsed.length < 4) {
		throw new Error('Error on parsing login redirect URL')
	}
	return {
		server: parsed[1],
		user: decodeURIComponent(parsed[2].replaceAll('+', ' ')),
		password: decodeURIComponent(parsed[3].replaceAll('+', ' ')),
	}
}
