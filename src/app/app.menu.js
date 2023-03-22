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

const {
	app,
	shell,
	Menu,
} = require('electron')
const { isMac } = require('../shared/os.utils.js')
const packageJson = require('../../package.json')
const { createHelpWindow } = require('../help/help.window.js')

/**
 * Setup application menu
 */
function setupMenu() {
	const macAppMenu = {
		label: app.name,
		submenu: [
			{ role: 'about' },
			{ type: 'separator' },
			{ role: 'services' },
			{ type: 'separator' },
			{ role: 'hide' },
			{ role: 'hideOthers' },
			{ role: 'unhide' },
			{ type: 'separator' },
			{ role: 'quit' },
		],
	}

	const editMenuItemsMac = [
		{ role: 'undo' },
		{ role: 'redo' },
		{ type: 'separator' },
		{ role: 'cut' },
		{ role: 'copy' },
		{ role: 'paste' },
		{ role: 'pasteAndMatchStyle' },
		{ role: 'delete' },
		{ role: 'selectAll' },
		{ type: 'separator' },
		{
			label: 'Speech',
			submenu: [
				{ role: 'startSpeaking' },
				{ role: 'stopSpeaking' },
			],
		},
	]

	const editMenuItems = [
		{ role: 'undo' },
		{ role: 'redo' },
		{ type: 'separator' },
		{ role: 'cut' },
		{ role: 'copy' },
		{ role: 'paste' },
		{ role: 'delete' },
		{ type: 'separator' },
		{ role: 'selectAll' },
	]

	const editMenu = {
		label: 'Edit',
		submenu: isMac() ? editMenuItemsMac : editMenuItems,
	}

	const viewMenu = {
		label: 'View',
		submenu: [
			{ role: 'reload' },
			{ role: 'forceReload' },
			{ role: 'toggleDevTools' },
			{ type: 'separator' },
			{ role: 'resetZoom' },
			{ role: 'zoomIn' },
			// By default zoomIn works by "CommandOrControl + +" ("CommandOrControl + SHIFT + =")
			// Hidden menu item adds zoomIn without SHIFT
			{
				role: 'zoomIn',
				accelerator: 'CommandOrControl+=',
				visible: false,
			},
			{ role: 'zoomOut' },
			{ type: 'separator' },
			{ role: 'togglefullscreen' },
		],
	}

	const windowMenuItemsMac = [
		{ role: 'minimize' },
		{ role: 'zoom' },
		{ type: 'separator' },
		{ role: 'front' },
		{ type: 'separator' },
		{ role: 'window' },

	]

	const windowMenuItems = [
		{ role: 'minimize' },
		{ role: 'zoom' },
		{ role: 'close' },
	]

	const windowMenu = {
		label: 'Window',
		submenu: isMac() ? windowMenuItemsMac : windowMenuItems,
	}

	const createLinkMenuItem = (label, link) => ({
		label,
		click: async () => {
			await shell.openExternal(link)
		},
	})

	const helpMenu = {
		role: 'help',
		submenu: [
			{
				label: 'About',
				click: (event, focusedWindow) => {
					createHelpWindow(focusedWindow)
				},
			},
			createLinkMenuItem('Homepage', packageJson.repository.url),
			createLinkMenuItem('Report a bug', packageJson.bugs),
			createLinkMenuItem('Source Code', packageJson.repository.url),
			createLinkMenuItem(`License ${packageJson.license}`, 'https://www.gnu.org/licenses/agpl-3.0.txt'),
		],
	}

	const template = [
		// { role: 'appMenu' }
		...(isMac() ? [macAppMenu] : []),
		// { role: 'fileMenu' }
		{
			label: 'File',
			submenu: [isMac() ? { role: 'close' } : { role: 'quit' }],
		},
		// { role: 'editMenu' }
		editMenu,
		// { role: 'viewMenu' }
		viewMenu,
		// { role: 'windowMenu' }
		windowMenu,
		// { role: 'help' }
		helpMenu,
	]

	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)
}

module.exports = {
	setupMenu,
}
