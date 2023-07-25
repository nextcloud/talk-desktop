/*
 * @copyright Copyright (c) 2022 Grigorii Shartsev <me@shgk.me>
 *
 * @author Grigorii Shartsev <me@shgk.me>
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

const { BrowserWindow } = require('electron')
const {
	windowOpenExternalLinkHandler,
	willNavigateExternalLinkHandler,
} = require('../app/externalLinkHandlers.js')
const { applyContextMenu } = require('../app/applyContextMenu.js')
const { applyDownloadNotification } = require('../app/applyDownloadNotification.js')
const { applyWheelZoom } = require('../app/applyWheelZoom.js')
const { setupTray } = require('../app/app.tray.js')

/**
 * @return {import('electron').BrowserWindow}
 */
function createTalkWindow() {
	const talkWindowOptions = {
		minWidth: 600,
		minHeight: 400,
		backgroundColor: '#171717',
		autoHideMenuBar: true,
		webPreferences: {
			preload: TALK_WINDOW_PRELOAD_WEBPACK_ENTRY,
		},
	}

	const window = new BrowserWindow({
		...talkWindowOptions,
		width: 1280,
		height: 800,
		show: false,
	})

	// TODO: return it on release
	/*
	if (process.env.NODE_ENV === 'production') {
		window.removeMenu()
	}
	 */

	window.webContents.on('will-navigate', willNavigateExternalLinkHandler)
	window.webContents.setWindowOpenHandler((details) => windowOpenExternalLinkHandler(details, {
		...talkWindowOptions,
		width: 800,
		height: 600,
	}))

	window.once('ready-to-show', () => {
		window.show()
	})

	applyContextMenu(window)
	applyDownloadNotification(window)
	applyWheelZoom(window)
	setupTray(window)

	window.loadURL(TALK_WINDOW_WEBPACK_ENTRY)

	return window
}

module.exports = {
	createTalkWindow,
}
