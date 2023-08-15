/*
 * @copyright Copyright (c) 2023 Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
 *
 * @author Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
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
