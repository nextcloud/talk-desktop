/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { BrowserWindow } = require('electron')
const { TITLE_BAR_HEIGHT } = require('../constants.js')
const { applyContextMenu } = require('../app/applyContextMenu.js')
const { getBrowserWindowIcon } = require('../shared/icons.utils.js')
const { getAppConfig } = require('../app/AppConfig.ts')
const { getScaledWindowSize, applyZoom, buildTitle } = require('../app/utils.ts')

/**
 * @return {import('electron').BrowserWindow}
 */
function createAuthenticationWindow() {
	const zoomFactor = getAppConfig('zoomFactor')
	const window = new BrowserWindow({
		title: buildTitle('Authentication'),
		...getScaledWindowSize({
			width: 450,
			height: 500,
		}),
		show: false,
		maximizable: false,
		resizable: false,
		fullscreenable: false,
		autoHideMenuBar: true,
		webPreferences: {
			preload: AUTHENTICATION_WINDOW_PRELOAD_WEBPACK_ENTRY,
		},
		icon: getBrowserWindowIcon(),
		titleBarStyle: getAppConfig('systemTitleBar') ? 'default' : 'hidden',
		titleBarOverlay: {
			color: '#00679E00', // Transparent
			symbolColor: '#FFFFFF', // White
			height: Math.round(TITLE_BAR_HEIGHT * zoomFactor),
		},
		// Position of the top left corner of the traffic light on Mac
		trafficLightPosition: {
			x: 12, // Same as on Talk Window
			y: Math.round((TITLE_BAR_HEIGHT * zoomFactor - 16) / 2), // 16 is the default traffic light button diameter
		},
	})

	// TODO: return this on release
	// if (process.env.NODE_ENV === 'production') {
	// window.removeMenu()
	// }

	applyContextMenu(window)
	applyZoom(window)

	window.loadURL(AUTHENTICATION_WINDOW_WEBPACK_ENTRY)

	return window
}

module.exports = {
	createAuthenticationWindow,
}
