/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { BrowserWindow } = require('electron')
const { getAppConfig } = require('../app/AppConfig.ts')
const { isMac } = require('../app/system.utils.ts')
const { getScaledWindowSize, applyZoom, getWindowUrl } = require('../app/utils.ts')
const { BUILD_CONFIG } = require('../shared/build.config.ts')
const { getBrowserWindowIcon } = require('../shared/icons.utils.js')

/**
 * @return {import('electron').BrowserWindow}
 */
function createWelcomeWindow() {
	const zoomFactor = getAppConfig('zoomFactor')
	const window = new BrowserWindow({
		...getScaledWindowSize({
			width: 300,
			height: 500,
		}, false),
		backgroundColor: BUILD_CONFIG.backgroundColor,
		resizable: false,
		autoHideMenuBar: true,
		center: true,
		fullscreenable: false,
		titleBarStyle: 'hidden',
		show: false,
		useContentSize: true,
		webPreferences: {
			preload: TALK_DESKTOP__WINDOW_WELCOME_PRELOAD_WEBPACK_ENTRY,
			zoomFactor,
		},
		icon: getBrowserWindowIcon(),
	})

	// Hide traffic light buttons on Mac
	if (isMac) {
		window.setWindowButtonVisibility(false)
	}

	applyZoom(window)

	window.loadURL(getWindowUrl('welcome'))

	return window
}

module.exports = {
	createWelcomeWindow,
}
