/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { BrowserWindow } = require('electron')
const { setupTray } = require('../app/app.tray.js')
const { getAppConfig } = require('../app/AppConfig.ts')
const { applyContextMenu } = require('../app/applyContextMenu.js')
const { applyDownloadHandler } = require('../app/downloads.ts')
const { applyExternalLinkHandler } = require('../app/externalLinkHandlers.ts')
const { getScaledWindowMinSize, getScaledWindowSize, applyZoom, buildTitle, getWindowUrl } = require('../app/utils.ts')
const { applyWheelZoom } = require('../app/zoom.service.ts')
const { TITLE_BAR_HEIGHT } = require('../constants.js')
const { BUILD_CONFIG } = require('../shared/build.config.ts')
const { getBrowserWindowIcon } = require('../shared/icons.utils.js')

/**
 * @return {import('electron').BrowserWindow}
 */
function createTalkWindow() {
	const zoomFactor = getAppConfig('zoomFactor')

	const talkWindowOptions = {
		title: buildTitle(),
		...getScaledWindowMinSize({
			minWidth: 600,
			minHeight: 400,
		}),
		backgroundColor: BUILD_CONFIG.backgroundColor,
		autoHideMenuBar: true,
		webPreferences: {
			preload: TALK_DESKTOP__WINDOW_TALK_PRELOAD_WEBPACK_ENTRY,
			zoomFactor,
		},
		icon: getBrowserWindowIcon(),
		titleBarStyle: getAppConfig('systemTitleBar') ? 'default' : 'hidden',
		titleBarOverlay: {
			color: '#00000000', // Transparent
			symbolColor: '#FFFFFF', // White
			height: Math.round(TITLE_BAR_HEIGHT * zoomFactor),
		},
		// Position of the top left corner of the traffic light on Mac
		trafficLightPosition: {
			x: 12, // In line with SearchBox
			y: Math.round((TITLE_BAR_HEIGHT * zoomFactor - 16) / 2), // 16 is the default traffic light button diameter
		},
	}

	const window = new BrowserWindow({
		...talkWindowOptions,
		...getScaledWindowSize({
			width: 1400,
			height: 900,
		}),
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
		...getScaledWindowSize({
			width: 800,
			height: 600,
		}),
	})

	applyContextMenu(window)
	applyDownloadHandler(window)
	applyWheelZoom(window)
	applyZoom(window)

	setupTray(window)

	window.loadURL(getWindowUrl('talk') + '#/apps/spreed')

	return window
}

module.exports = {
	createTalkWindow,
}
