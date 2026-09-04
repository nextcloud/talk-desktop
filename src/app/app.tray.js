/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { app, Tray, Menu, nativeTheme } = require('electron')
const { getTrayIconPath } = require('../shared/icons.utils.js')
const { createTrayIconWithBadge, clearTrayIconCache } = require('./trayBadge.utils.ts')

let isAppQuitting = false

/** @type {import('electron').Tray | null} */
let trayInstance = null

/** @type {number} */
let currentBadgeCount = 0

/**
 * Allow quitting the app if requested. It minimizes to a tray otherwise.
 */
app.on('before-quit', () => {
	isAppQuitting = true
})

/**
 * Update the tray icon with the current badge count
 */
async function refreshTrayIcon() {
	if (!trayInstance) {
		return
	}

	try {
		const iconPath = getTrayIconPath()
		const icon = await createTrayIconWithBadge(iconPath, currentBadgeCount)
		trayInstance.setImage(icon)
	} catch (error) {
		console.error('Failed to update tray icon with badge:', error)
	}
}

/**
 * Update the tray badge count
 *
 * @param {number} count - Number of unread messages (0 to hide badge)
 */
async function updateTrayBadge(count) {
	currentBadgeCount = count
	await refreshTrayIcon()
}

/**
 * Setup tray with an icon that provides a context menu.
 *
 * @param {import('electron').BrowserWindow} browserWindow Browser window, associated with the tray
 * @return {import('electron').Tray} Tray instance
 */
function setupTray(browserWindow) {
	const iconPath = getTrayIconPath()
	trayInstance = new Tray(iconPath)
	trayInstance.setToolTip(app.name)
	trayInstance.setContextMenu(Menu.buildFromTemplate([
		{
			label: 'Open',
			click: () => browserWindow.show(),
		},
		{
			role: 'quit',
		},
	]))
	trayInstance.on('click', () => browserWindow.show())

	// Refresh icon when theme changes (for monochrome icon support)
	nativeTheme.on('updated', () => {
		clearTrayIconCache()
		refreshTrayIcon()
	})

	browserWindow.on('close', (event) => {
		if (!isAppQuitting) {
			event.preventDefault()
			browserWindow.hide()
		}
	})

	browserWindow.on('closed', () => {
		if (trayInstance) {
			trayInstance.destroy()
			trayInstance = null
		}
	})

	return trayInstance
}

module.exports = {
	setupTray,
	updateTrayBadge,
}
