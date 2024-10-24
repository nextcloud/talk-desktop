/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import path from 'node:path'
import { Notification, shell } from 'electron'
import type { BrowserWindow } from 'electron'

/**
 * Handle downloads from a browser window to show notifications
 * @param browserWindow - Browser window
 */
export function applyDownloadHandler(browserWindow: BrowserWindow) {
	browserWindow.webContents.session.on('will-download', (event, item) => {
		item.once('done', (event, state) => {
			const pathToFile = item.getSavePath()
			const { base, dir } = path.parse(pathToFile)
			let notification

			if (state === 'completed') {
				notification = new Notification({
					title: 'Download complete',
					body: `File '${base}' can be found at '${dir}'.`,
				})
				notification.on('click', () => {
					shell.showItemInFolder(pathToFile)
				})
			} else if (state === 'interrupted') {
				notification = new Notification({
					title: 'Download Failed',
					body: `Something went wrong with the download of '${base}'.`,
				})
			}

			notification?.show()
		})
	})
}
