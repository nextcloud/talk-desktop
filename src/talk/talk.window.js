/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { BrowserWindow, screen } = require('electron')
const { applyExternalLinkHandler } = require('../app/externalLinkHandlers.js')
const { applyContextMenu } = require('../app/applyContextMenu.js')
const { applyDownloadNotification } = require('../app/applyDownloadNotification.js')
const { applyWheelZoom } = require('../app/applyWheelZoom.js')
const { setupTray } = require('../app/app.tray.js')
const { getBrowserWindowIcon } = require('../shared/icons.utils.js')
const { TITLE_BAR_HEIGHT } = require('../constants.js')
const { getAppConfig } = require('../app/AppConfig.ts')

/**
 * @return {import('electron').BrowserWindow}
 */
function createTalkWindow() {
	const primaryDisplay = screen.getPrimaryDisplay()
	const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

	const talkWindowOptions = {
		minWidth: 600,
		minHeight: 400,
		backgroundColor: '#00679E',
		autoHideMenuBar: true,
		webPreferences: {
			preload: TALK_WINDOW_PRELOAD_WEBPACK_ENTRY,
		},
		icon: getBrowserWindowIcon(),
		titleBarStyle: getAppConfig('systemTitleBar') ? 'default' : 'hidden',
		titleBarOverlay: {
			color: '#00679E00', // Transparent
			symbolColor: '#FFFFFF', // White
			height: TITLE_BAR_HEIGHT,
		},
		// Position of the top left corner of the traffic light on Mac
		trafficLightPosition: {
			x: 12, // In line with SearchBox
			y: (TITLE_BAR_HEIGHT - 16) / 2, // 16 is the default traffic light button diameter
		},
	}

	const window = new BrowserWindow({
		...talkWindowOptions,
		width: Math.min(1400, screenWidth),
		height: Math.min(900, screenHeight),
		show: false,
	})

	// TODO: return it on release
	/*
	if (process.env.NODE_ENV === 'production') {
		window.removeMenu()
	}
	 */

	applyExternalLinkHandler(window, {
		...talkWindowOptions,
		width: Math.min(800, screenWidth),
		height: Math.min(600, screenHeight),
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
