/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { appData } from '../app/AppData.js'

/**
 * Load styles from URL via new <link> element
 *
 * @param {string} url - Styles URL
 * @return {Promise<HTMLLinkElement>} Created styles link element
 */
export async function loadCss(url) {
	return new Promise((resolve, reject) => {
		const link = document.createElement('link')
		link.rel = 'stylesheet'
		link.href = url
		document.querySelector('head').appendChild(link)
		link.onload = () => resolve(link)
		link.onerror = (error) => reject(error)
	})

}

/**
 * Load styles from URL via loadCss from server host
 *
 * @param {string} url - Styles URL
 * @return {Promise<HTMLLinkElement>} Created styles link element
 */
export function loadServerCss(url) {
	return loadCss(`${appData.serverUrl}${url}`)
}
