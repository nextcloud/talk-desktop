/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { BrowserWindow } from 'electron'
import { applyContextMenu } from '../app/applyContextMenu.js'
import { applyExternalLinkHandler } from '../app/externalLinkHandlers.ts'
import { applyZoom, buildTitle, getScaledWindowSize, getWindowUrl, onReadyToShow } from '../app/utils.ts'
import { getBrowserWindowIcon } from '../shared/icons.utils.js'

/**
 *
 * @param {import('electron').BrowserWindow} parentWindow - main window (parent)
 * @return {import('electron').BrowserWindow}
 */
export function createHelpWindow(parentWindow) {
	const window = new BrowserWindow({
		title: buildTitle(),
		...getScaledWindowSize({
			width: 1024,
			height: 720,
		}),
		show: false,
		maximizable: false,
		minimizable: false,
		resizable: false,
		fullscreenable: false,
		autoHideMenuBar: true,
		parent: parentWindow,
		modal: true,
		webPreferences: {
			preload: TALK_DESKTOP__WINDOW_HELP_PRELOAD_WEBPACK_ENTRY,
		},
		icon: getBrowserWindowIcon(),
	})

	window.removeMenu()

	window.loadURL(getWindowUrl('help'))

	applyExternalLinkHandler(window)
	applyContextMenu(window)
	applyZoom(window)

	onReadyToShow(window, () => window.show())

	return window
}
