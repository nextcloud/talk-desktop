/*
 * @copyright Copyright (c) 2023 Maksim Sukharev <antreesy.web@gmail.com>
 *
 * @author Maksim Sukharev <antreesy.web@gmail.com>
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
