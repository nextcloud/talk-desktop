/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { BrowserWindow } = require('electron')
const { BASE_TITLE, TITLE_BAR_HEIGHT } = require('../constants.js')
const { applyContextMenu } = require('../app/applyContextMenu.js')
const { getBrowserWindowIcon } = require('../shared/icons.utils.js')
const { isLinux } = require('../shared/os.utils.js')

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
		icon: getBrowserWindowIcon(),
		titleBarStyle: isLinux() ? 'default' : 'hidden',
		titleBarOverlay: {
			color: '#00679E00', // Transparent
			symbolColor: '#FFFFFF', // White
			height: TITLE_BAR_HEIGHT,
		},
		// Position of the top left corner of the traffic light on Mac
		trafficLightPosition: {
			x: 12, // Same as on Talk Window
			y: (TITLE_BAR_HEIGHT - 16) / 2, // 16 is the default traffic light button diameter
		},
	})

	// TODO: return this on release
	// if (process.env.NODE_ENV === 'production') {
	// window.removeMenu()
	// }

	applyContextMenu(window)

	window.loadURL(AUTHENTICATION_WINDOW_WEBPACK_ENTRY)

	return window
}

module.exports = {
	createAuthenticationWindow,
}
