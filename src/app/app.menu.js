/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { app, shell, Menu } = require('electron')
const packageJson = require('../../package.json')
const { createHelpWindow } = require('../help/help.window.js')
const { BUILD_CONFIG } = require('../shared/build.config.ts')
const { isMac } = require('./system.utils.ts')
const { increaseZoom, decreaseZoom, setZoom } = require('./zoom.service.ts')

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
		submenu: isMac ? editMenuItemsMac : editMenuItems,
	}

	const viewMenu = {
		label: 'View',
		submenu: [
			{ role: 'reload' },
			{ role: 'forceReload' },
			{ role: 'toggleDevTools' },
			{ type: 'separator' },
			{ label: 'Reset Zoom', accelerator: 'CommandOrControl+0', click: (event, browserWindow) => setZoom(browserWindow, 1) },
			{ label: 'Zoom In', accelerator: 'CommandOrControl+=', click: (event, browserWindow) => increaseZoom(browserWindow) },
			{ label: 'Zoom Out', accelerator: 'CommandOrControl+-', click: (event, browserWindow) => decreaseZoom(browserWindow) },
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
		submenu: isMac ? windowMenuItemsMac : windowMenuItems,
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
				accelerator: 'F1',
				click: (event, focusedWindow) => {
					createHelpWindow(focusedWindow)
				},
			},
			...(BUILD_CONFIG.isBranded
				? []
				: [
						createLinkMenuItem('Homepage', packageJson.repository.url),
						createLinkMenuItem('Report a bug', packageJson.bugs),
						createLinkMenuItem('Source Code', packageJson.repository.url),
					]
			),
			createLinkMenuItem(`License ${packageJson.license}`, 'https://www.gnu.org/licenses/agpl-3.0.txt'),
		],
	}

	const template = [
		// { role: 'appMenu' }
		...(isMac ? [macAppMenu] : []),
		// { role: 'fileMenu' }
		{
			label: 'File',
			submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
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
