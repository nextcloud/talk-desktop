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

const os = require('node:os')
const { BrowserWindow } = require('electron')
const { BASE_TITLE } = require('../constants.js')
const { parseLoginRedirectUrl } = require('./login.service.js')

/**
 * Open a web-view modal window with Nextcloud Server login page
 *
 * @param {import('electron').BrowserWindow} parentWindow - Parent window
 * @param {string} serverUrl - Server URL
 * @return {Promise<import('./login.service.js').Credentials|Error>}
 */
function openLoginWebView(parentWindow, serverUrl) {
	return new Promise((resolve, reject) => {
		const WIDTH = 750
		const HEIGHT = 750
		const TITLE = `Login - ${BASE_TITLE}`

		const window = new BrowserWindow({
			title: TITLE,
			width: WIDTH,
			height: HEIGHT,
			minWidth: WIDTH,
			minHeight: HEIGHT,
			resizable: true,
			center: true,
			fullscreenable: false,
			parent: parentWindow,
			modal: true,
			autoHideMenuBar: true,
			webPreferences: {
				partition: 'non-persist:login-web-view',
				nodeIntegration: false,
			},
		})
		window.removeMenu()

		window.loadURL(`${serverUrl}/index.php/login/flow`, {
			// This header value is used as an application name on the Login page
			// Use BASE_TITLE instead of the USER_AGENT as User-Agent header
			userAgent: `${os.hostname()} (${BASE_TITLE})`,
			extraHeaders: 'OCS-APIRequest: true',
		})

		window.webContents.on('did-start-loading', () => {
			window.setTitle(`${TITLE} [Loading...]`)
			window.setProgressBar(2, { mode: 'indeterminate' })
		})

		window.webContents.on('did-stop-loading', () => {
			window.setTitle(TITLE)
			window.setProgressBar(-1)
		})

		window.webContents.on('will-redirect', (event, url) => {
			if (url.startsWith('nc://')) {
				// Stop redirect to nc:// app protocol
				event.preventDefault()
				try {
					const credentials = parseLoginRedirectUrl(url)
					resolve(credentials)
				} catch (e) {
					resolve(new Error('Unexpected server error'))
				} finally {
					// Anyway close the window
					window.close()
				}
			}
		})

		window.on('close', () => {
			resolve(new Error('Login window was closed'))
		})
	})
}

module.exports = {
	openLoginWebView,
}
