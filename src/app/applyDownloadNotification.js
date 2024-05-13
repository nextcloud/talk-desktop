/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const path = require('node:path')
const { Notification, shell } = require('electron')

/**
 * Enable native OS notifications for downloaded files
 *
 * @param {import('electron').BrowserWindow} browserWindow - Browser window
 */
export function applyDownloadNotification(browserWindow) {
	browserWindow.webContents.session.on('will-download', (event, item, webContents) => {
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
			} else {
				notification = new Notification({
					title: 'Download Failed',
					body: `Something went wrong with the download of '${base}'.`,
				})
			}

			notification.show()
		})
	})
}
