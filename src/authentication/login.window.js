/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { BrowserWindow, app } = require('electron')
const os = require('node:os')
const { getAppConfig } = require('../app/AppConfig.ts')
const { applyContextMenu } = require('../app/applyContextMenu.js')
const { osTitle } = require('../app/system.utils.ts')
const { getScaledWindowMinSize, getScaledWindowSize, applyZoom } = require('../app/utils.ts')
const { getBrowserWindowIcon } = require('../shared/icons.utils.js')
const { parseLoginRedirectUrl } = require('./login.service.js')

const genId = () => Math.random().toString(36).slice(2, 9)

/**
 * Open a web-view modal window with Nextcloud Server login page
 *
 * @param {import('electron').BrowserWindow} parentWindow - Parent window
 * @param {string} serverUrl - Server URL
 * @return {Promise<import('./login.service.js').Credentials|Error>}
 */
function openLoginWebView(parentWindow, serverUrl) {
	return new Promise((resolve) => {
		const WIDTH = 750
		const HEIGHT = 750

		const zoomFactor = getAppConfig('zoomFactor')

		const window = new BrowserWindow({
			...getScaledWindowSize({
				width: WIDTH,
				height: HEIGHT,
			}),
			...getScaledWindowMinSize({
				width: WIDTH,
				height: HEIGHT,
			}),
			useContentSize: true,
			resizable: true,
			center: true,
			fullscreenable: false,
			parent: parentWindow,
			modal: true,
			autoHideMenuBar: true,
			webPreferences: {
				partition: `non-persist:login-web-view-${genId()}`,
				nodeIntegration: false,
				zoomFactor,
			},
			icon: getBrowserWindowIcon(),
		})
		window.removeMenu()

		window.loadURL(`${serverUrl}/index.php/login/flow`, {
			// This header value is used as an application name on the Login page
			// Use BASE_TITLE instead of the USER_AGENT as User-Agent header
			userAgent: `${os.hostname()} (Talk Desktop Client - ${osTitle})`,
			extraHeaders: [
				'OCS-APIRequest: true',
				`Accept-Language: ${app.getPreferredSystemLanguages().join(',')}`,
			].join('\n'),
		})

		window.webContents.on('did-start-loading', () => {
			window.setTitle('[Loading...]')
			window.setProgressBar(2, { mode: 'indeterminate' })
		})

		window.webContents.on('did-stop-loading', () => {
			window.setProgressBar(-1)
		})

		window.webContents.on('will-redirect', (event, url) => {
			if (url.startsWith('nc://')) {
				// Stop redirect to nc:// app protocol
				event.preventDefault()
				try {
					const credentials = parseLoginRedirectUrl(url)
					resolve(credentials)
				} catch {
					resolve(new Error('Unexpected server error'))
				} finally {
					// Anyway close the window
					window.close()
				}
			}
		})

		applyContextMenu(window)
		applyZoom(window)

		window.on('close', () => {
			resolve(new Error('Login window was closed'))
		})
	})
}

module.exports = {
	openLoginWebView,
}
