/*
 * @copyright Copyright (c) 2022 Grigorii Shartsev <me@shgk.me>
 *
 * @author Grigorii Shartsev <me@shgk.me>
 *
 * @license AGPL-3.0-or-later
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
const { getBrowserWindowIcon } = require('../shared/icons.utils.js')
const { isMac } = require('../shared/os.utils.js')

/**
 * @return {import('electron').BrowserWindow}
 */
function createWelcomeWindow() {
	const window = new BrowserWindow({
		width: 300,
		height: 500,
		resizable: false,
		autoHideMenuBar: true,
		center: true,
		fullscreenable: false,
		titleBarStyle: 'hidden',
		show: false,
		useContentSize: true,
		webPreferences: {
			preload: WELCOME_WINDOW_PRELOAD_WEBPACK_ENTRY,
		},
		icon: getBrowserWindowIcon(),
	})

	if (isMac()) {
		// Hide traffic light buttons on Mac
		window.setWindowButtonVisibility(false)
	}

	window.loadURL(WELCOME_WINDOW_WEBPACK_ENTRY)

	return window
}

module.exports = {
	createWelcomeWindow,
}
