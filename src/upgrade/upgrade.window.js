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
 * @return {import('electron').BrowserWindow}
 */
function createUpgradeWindow() {
	const WIDTH = 350
	const HEIGHT = 300
	const TITLE = `Upgrade required - ${BASE_TITLE}`
	const window = new BrowserWindow({
		title: TITLE,
		width: WIDTH,
		height: HEIGHT,
		show: false,
		maximizable: false,
		resizable: false,
		fullscreenable: false,
		autoHideMenuBar: true,
		webPreferences: {
			preload: UPGRADE_WINDOW_PRELOAD_WEBPACK_ENTRY,
		},
		icon: getBrowserWindowIcon(),
	})

	window.removeMenu()

	window.loadURL(UPGRADE_WINDOW_WEBPACK_ENTRY)

	applyExternalLinkHandler(window)

	window.on('ready-to-show', () => {
		window.show()
	})

	return window
}

module.exports = {
	createUpgradeWindow,
}
