/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { BASE_TITLE } = require('../constants.js')
const { BrowserWindow } = require('electron')
const { applyExternalLinkHandler } = require('../app/externalLinkHandlers.js')
const { getBrowserWindowIcon } = require('../shared/icons.utils.js')
const { getScaledWindowSize, applyZoom } = require('../app/utils.ts')
const { applyContextMenu } = require('../app/applyContextMenu.js')

/**
 *
 * @param {import('electron').BrowserWindow} parentWindow - main window (parent)
 * @return {import('electron').BrowserWindow}
 */
function createHelpWindow(parentWindow) {
	const TITLE = `About - ${BASE_TITLE}`
	const vibrancies = [null, 'titlebar', 'selection', 'menu', 'popover', 'sidebar', 'header', 'sheet', 'window', 'hud', 'fullscreen-ui', 'tooltip', 'content', 'under-window', 'under-page']
	const window = new BrowserWindow({
		transparent: true,
		...getScaledWindowSize({
			width: 1024,
			height: 720,
		}),
		title: TITLE,
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
		titleBarStyle: 'hidden',
		icon: getBrowserWindowIcon(),
	})

	let i = 0
	setInterval(() => {
		console.log(vibrancies[i])
		window.setVibrancy(vibrancies[i])
		i = (i + 1) % vibrancies.length
	}, 5000)

	window.removeMenu()

	window.loadURL(HELP_WINDOW_WEBPACK_ENTRY)

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
