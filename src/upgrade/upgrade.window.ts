/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { BrowserWindow } = require('electron')
const { applyExternalLinkHandler } = require('../app/externalLinkHandlers.ts')
const { getBrowserWindowIcon } = require('../shared/icons.utils.js')
const { getScaledWindowSize, applyZoom, buildTitle } = require('../app/utils.ts')

/**
 *
 * @return {import('electron').BrowserWindow}
 */
function createUpgradeWindow() {
	const TITLE = buildTitle('Upgrade required')
	const window = new BrowserWindow({
		title: TITLE,
		...getScaledWindowSize({
			width: 350,
			height: 300,
		}),
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
	applyZoom(window)

	window.on('ready-to-show', () => {
		window.show()
	})

	return window
}

module.exports = {
	createUpgradeWindow,
}
