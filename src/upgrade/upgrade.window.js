/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { BASE_TITLE } = require('../constants.js')
const { BrowserWindow } = require('electron')
const { applyExternalLinkHandler } = require('../app/externalLinkHandlers.js')
const { getBrowserWindowIcon } = require('../shared/icons.utils.js')
const { getScaledWindowSize, showWhenWindowMarkedReady } = require('../app/utils.ts')

/**
 *
 * @return {import('electron').BrowserWindow}
 */
function createUpgradeWindow() {
	const TITLE = `Upgrade required - ${BASE_TITLE}`
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

	showWhenWindowMarkedReady(window)

	return window
}

module.exports = {
	createUpgradeWindow,
}
