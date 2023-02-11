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

const { BrowserWindow, BrowserView } = require('electron')
const {
	BASE_TITLE,
	USER_AGENT,
} = require('../constants')
const { parseLoginRedirectUrl } = require('./login.service')

/**
 * Open a web-view modal window with Nextcloud Server login page
 *
 * @param {Electron.BrowserWindow} parentWindow
 * @param {string} serverUrl
 * @param {Function} onSuccess
 * @param {Function} onFail
 */
function createLoginWindow({
	parentWindow,
	serverUrl,
	onSuccess,
	onFail,
}) {
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
		webPreferences: {
			partition: 'non-persist:login-web-view',
			nodeIntegration: false,
		},
	})
	window.removeMenu()

	const browserView = new BrowserView()
	window.setBrowserView(browserView)
	browserView.setBounds({ x: 0, y: 0, width: WIDTH, height: HEIGHT })

	browserView.webContents.on('did-start-loading', () => {
		window.setTitle(`${TITLE} [Loading...]`)
		window.setProgressBar(2, { mode: 'indeterminate' })
	})

	browserView.webContents.on('did-stop-loading', () => {
		window.setTitle(TITLE)
		window.setProgressBar(-1)
	})

	browserView.webContents.on('will-redirect', (event, url) => {
		if (url.startsWith('nc://')) {
			// Stop redirect to nc:// app protocol
			event.preventDefault()
			try {
				const credentials = parseLoginRedirectUrl(url)
				onSuccess(credentials)
			} catch (e) {
				onFail(e)
			}
			// Anyway close the window
			window.close()
		}
	})

	browserView.webContents.loadURL(`${serverUrl}/index.php/login/flow`, {
		userAgent: USER_AGENT,
		extraHeaders: 'OCS-APIRequest: true',
	})

	window.on('close', () => {
		onFail()
	})

	return window
}

module.exports = {
	createLoginWindow,
}
