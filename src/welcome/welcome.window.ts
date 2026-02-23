/*!
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { BrowserWindow } from 'electron'
import { getAppConfig } from '../app/AppConfig.ts'
import { isMac } from '../app/system.utils.ts'
import { applyZoom, getScaledWindowSize, getWindowUrl } from '../app/utils.ts'
import { BUILD_CONFIG } from '../shared/build.config.ts'
import { getBrowserWindowIcon } from '../shared/icons.utils.js'

/**
 * Creates the welcome window
 */
export function createWelcomeWindow() {
	const zoomFactor = getAppConfig('zoomFactor')
	const window = new BrowserWindow({
		...getScaledWindowSize({
			width: 300,
			height: 500,
		}, false),
		backgroundColor: BUILD_CONFIG.brandColor,
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
