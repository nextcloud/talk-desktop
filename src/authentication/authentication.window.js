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

const { BrowserWindow } = require('electron')
const { BASE_TITLE } = require('../constants.js')

/**
 * @return {import('electron').BrowserWindow}
 */
function createAuthenticationWindow() {
	const WIDTH = 450
	const HEIGHT = 500
	const TITLE = `Authentication - ${BASE_TITLE}`
	const window = new BrowserWindow({
		title: TITLE,
		width: WIDTH,
		height: HEIGHT,
		show: false,
		maximizable: false,
		resizable: false,
		fullscreenable: false,
		autoHideMenuBar: true,
		webPreferences: {
			preload: AUTHENTICATION_WINDOW_PRELOAD_WEBPACK_ENTRY,
		},
	})

	// TODO: return this on release
	// if (process.env.NODE_ENV === 'production') {
	// window.removeMenu()
	// }

	window.loadURL(AUTHENTICATION_WINDOW_WEBPACK_ENTRY)

	return window
}

module.exports = {
	createAuthenticationWindow,
}
