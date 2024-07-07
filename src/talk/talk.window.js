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

/**
 * @return {import('electron').BrowserWindow}
 */
function createTalkWindow() {
	const primaryDisplay = screen.getPrimaryDisplay()
	const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

	const talkWindowOptions = {
		minWidth: 600,
		minHeight: 400,
		backgroundColor: '#00669E',
		autoHideMenuBar: true,
		webPreferences: {
			preload: TALK_WINDOW_PRELOAD_WEBPACK_ENTRY,
		},
		icon: getBrowserWindowIcon(),
		// titleBarStyle: 'hidden',
		// titleBarOverlay: {
		// 	color: '#00669E00', // Transparent
		// 	symbolColor: '#FFFFFF', // White
		// 	height: 50,
		// },
		// Position of the top left corner of the traffic light on Mac
		trafficLightPosition: {
			x: 12, // In line with SearchBox
			y: (50 - 16) / 2, // 16 is the default traffic light button diameter
		},
	}

	const window = new BrowserWindow({
		...talkWindowOptions,
		width: Math.min(1680, screenWidth),
		height: Math.min(1050, screenHeight),
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
