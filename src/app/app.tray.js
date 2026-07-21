/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { app, Menu, Tray } from 'electron'
import path from 'node:path'
import { getTrayIcon } from '../shared/icons.utils.js'

let isAppQuitting = false

/**
 * Allow quitting the app if requested. It minimizes to a tray otherwise.
 */
app.on('before-quit', () => {
	isAppQuitting = true
})

/**
 * Setup tray with an icon that provides a context menu.
 *
 * @param {import('electron').BrowserWindow} browserWindow Browser window, associated with the tray
 * @return {import('electron').Tray} Tray instance
 */
export function setupTray(browserWindow) {
	const icon = path.resolve(import.meta.dirname, getTrayIcon())
	const tray = new Tray(icon)
	tray.setToolTip(app.name)
	tray.setContextMenu(Menu.buildFromTemplate([
		{
			label: 'Open',
			click: () => browserWindow.show(),
		},
		{
			role: 'quit',
		},
	]))
	tray.on('click', () => browserWindow.show())

	browserWindow.on('close', (event) => {
		if (!isAppQuitting) {
			event.preventDefault()
			browserWindow.hide()
		}
	})

	browserWindow.on('closed', () => {
		tray.destroy()
	})

	return tray
}
