/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { BASE_TITLE } = require('../constants.js')
const { BrowserWindow } = require('electron')
const { applyExternalLinkHandler } = require('../app/externalLinkHandlers.js')
const { getBrowserWindowIcon } = require('../shared/icons.utils.js')

/**
 *
 * @param {import('electron').BrowserWindow} parentWindow - main window (parent)
 * @return {import('electron').BrowserWindow}
 */
function createHelpWindow(parentWindow) {
	const WIDTH = 720
	const HEIGHT = 525
	const TITLE = `About - ${BASE_TITLE}`
	const window = new BrowserWindow({
		title: TITLE,
		width: WIDTH,
		height: HEIGHT,
		show: false,
		maximizable: false,
		resizable: false,
		fullscreenable: false,
		autoHideMenuBar: true,
		parent: parentWindow,
		modal: true,
		webPreferences: {
			preload: HELP_WINDOW_PRELOAD_WEBPACK_ENTRY,
		},
		icon: getBrowserWindowIcon(),
	})

	window.removeMenu()

	window.loadURL(HELP_WINDOW_WEBPACK_ENTRY)

	applyExternalLinkHandler(window)

	window.on('ready-to-show', () => {
		window.show()
	})

	return window
}

module.exports = {
	createHelpWindow,
}
