/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { BrowserWindow } from 'electron'
import { setupTray } from '../app/app.tray.js'
import { getAppConfig } from '../app/AppConfig.ts'
import { applyContextMenu } from '../app/applyContextMenu.js'
import { applyDownloadHandler } from '../app/downloads.ts'
import { applyExternalLinkHandler } from '../app/externalLinkHandlers.ts'
import { applyZoom, buildTitle, getScaledWindowMinSize, getScaledWindowSize, getTitleBarSymbolColor, getWindowUrl } from '../app/utils.ts'
import { applyWheelZoom } from '../app/zoom.service.ts'
import { TITLE_BAR_HEIGHT } from '../constants.js'
import { BUILD_CONFIG } from '../shared/build.config.ts'
import { getBrowserWindowIcon } from '../shared/icons.utils.js'

/**
 * @return {import('electron').BrowserWindow}
 */
export function createTalkWindow() {
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
			color: '#FFFFFF00',
			symbolColor: getTitleBarSymbolColor(),
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
