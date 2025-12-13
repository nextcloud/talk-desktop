/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { BrowserWindow, screen } from 'electron'
import { getAppConfig } from '../app/AppConfig.ts'
import { isMac, isWindows } from '../app/system.utils.ts'
import { applyZoom, getScaledWindowSize, getWindowUrl } from '../app/utils.ts'
import { BUILD_CONFIG } from '../shared/build.config.ts'
import { getBrowserWindowIcon } from '../shared/icons.utils.js'

export type CallboxParams = {
	/** Conversation token */
	token: string
	/** Conversation name */
	name: string
	/** Conversation type */
	type: 'one2one' | 'group' | 'public'
	/** Conversation avatar URL */
	avatar: string
	/**
	 * Debug mode without auto-dismiss on joined/missed
	 */
	debug?: 'true' | 'false'
}

/**
 * Create a callbox window
 *
 * @param params - Callbox parameters
 */
export function createCallboxWindow(params: CallboxParams) {
	const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize

	const { width, height } = getScaledWindowSize({
		width: 400,
		// 2 text lines + buttons line + 3 paddings around
		height: 15 * 1.5 * 2 + 34 + 12 * 3,
	})

	const window = new BrowserWindow({
		height,
		width,
		acceptFirstMouse: true,
		alwaysOnTop: true,
		autoHideMenuBar: true,
		backgroundColor: BUILD_CONFIG.backgroundColor,
		frame: false,
		fullscreenable: false,
		icon: getBrowserWindowIcon(),
		maximizable: false,
		minimizable: false,
		resizable: false,
		show: false,
		skipTaskbar: true,
		titleBarStyle: 'hidden',
		type: isWindows ? 'toolbar' : isMac ? 'panel' : 'normal',
		useContentSize: false,
		webPreferences: {
			preload: TALK_DESKTOP__WINDOW_CALLBOX_PRELOAD_WEBPACK_ENTRY,
			zoomFactor: getAppConfig('zoomFactor'),
		},
	})

	window.removeMenu()
	window.setPosition(Math.round((screenWidth - width) / 2), Math.round(height / 2))

	applyZoom(window)

	window.loadURL(getWindowUrl('callbox') + '?' + new URLSearchParams(params))

	window.once('ready-to-show', () => window.showInactive())

	return window
}
