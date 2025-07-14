/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { BrowserWindow } = require('electron')
const { applyContextMenu } = require('../app/applyContextMenu.js')
const { applyExternalLinkHandler } = require('../app/externalLinkHandlers.ts')
const { getScaledWindowSize, applyZoom, buildTitle, getWindowUrl } = require('../app/utils.ts')
const { getBrowserWindowIcon } = require('../shared/icons.utils.js')

/**
 *
 * @param {import('electron').BrowserWindow} parentWindow - main window (parent)
 * @return {import('electron').BrowserWindow}
 */
function createHelpWindow(parentWindow) {
	const window = new BrowserWindow({
		title: buildTitle(),
		...getScaledWindowSize({
			width: 1024,
			height: 720,
		}),
		show: false,
		maximizable: false,
		resizable: false,
		fullscreenable: false,
		autoHideMenuBar: true,
		parent: parentWindow,
		modal: true,
		webPreferences: {
			preload: TALK_DESKTOP__WINDOW_HELP_PRELOAD_WEBPACK_ENTRY,
		},
		titleBarStyle: 'hidden',
		icon: getBrowserWindowIcon(),
	})

	window.removeMenu()

	window.loadURL(getWindowUrl('help'))

	applyExternalLinkHandler(window)
	applyContextMenu(window)
	applyZoom(window)

	window.on('ready-to-show', () => {
		window.show()
	})

	return window
}

module.exports = {
	createHelpWindow,
}
