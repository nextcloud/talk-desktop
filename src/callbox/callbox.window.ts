/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { BrowserWindow, screen } from 'electron'
import { applyZoom, getScaledWindowSize } from '../app/utils.ts'
import { getBrowserWindowIcon } from '../shared/icons.utils.js'
import { isMac, isWindows } from '../app/system.utils.ts'
import { getAppConfig } from '../app/AppConfig.ts'

export type CallboxParams = {
	/** Conversation token */
	token: string
	/** Conversation name */
	name: string
	/** Conversation type */
	type: 'one2one' | 'group' | 'public'
	/** Conversation avatar URL */
	avatar: string
}

/**
 *
 * @param mainWindow
 * @param notification
 * @param params
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
		backgroundColor: '#00679E',
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
			preload: CALLBOX_WINDOW_PRELOAD_WEBPACK_ENTRY,
			zoomFactor: getAppConfig('zoomFactor'),
		},
	})

	window.removeMenu()
	window.setPosition(Math.round((screenWidth - width) / 2), Math.round(height / 2))

	applyZoom(window)

	window.loadURL(CALLBOX_WINDOW_WEBPACK_ENTRY + '?' + new URLSearchParams(params))

	window.once('ready-to-show', () => window.showInactive())
	// FIXME remove: this shows devtools with network requests made from callbox
	window.webContents.openDevTools()
	return window
}
