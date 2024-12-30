/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import os from 'node:os'
import { BrowserWindow, app } from 'electron'
import { parseLoginRedirectUrl } from './login.service.js'
import { osTitle } from '../app/system.utils.ts'
import { applyContextMenu } from '../app/applyContextMenu.js'
import { getBrowserWindowIcon } from '../shared/icons.utils.js'
import { getScaledWindowMinSize, getScaledWindowSize, applyZoom, buildTitle } from '../app/utils.ts'
import { getAppConfig } from '../app/AppConfig.ts'

const genId = () => Math.random().toString(36).slice(2, 9)

/**
 * Open a web-view modal window with Nextcloud Server login page
 *
 * @param parentWindow - Parent window
 * @param serverUrl - Server URL
 */
export function openLoginWebView(parentWindow: BrowserWindow, serverUrl: string) {
	return new Promise((resolve) => {
		const WIDTH = 750
		const HEIGHT = 750
		const TITLE = buildTitle('Login')

		const zoomFactor = getAppConfig('zoomFactor')

		const window = new BrowserWindow({
			title: TITLE,
			...getScaledWindowSize({
				width: WIDTH,
				height: HEIGHT,
			}),
			...getScaledWindowMinSize({
				minWidth: WIDTH,
				minHeight: HEIGHT,
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
					// Anyway, close the window
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
