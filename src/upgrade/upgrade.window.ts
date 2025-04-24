/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { BrowserWindow } from 'electron'
import { applyContextMenu } from '../app/applyContextMenu.js'
import { applyExternalLinkHandler } from '../app/externalLinkHandlers.ts'
import { applyZoom, buildTitle, getScaledWindowSize, getWindowUrl } from '../app/utils.ts'
import { getBrowserWindowIcon } from '../shared/icons.utils.js'

/**
 * Create the upgrade window
 */
export function createUpgradeWindow() {
	const TITLE = buildTitle('Upgrade required')
	const window = new BrowserWindow({
		title: TITLE,
		...getScaledWindowSize({
			width: 350,
			height: 300,
		}),
		show: false,
		maximizable: false,
		minimizable: false,
		resizable: false,
		fullscreenable: false,
		autoHideMenuBar: true,
		webPreferences: {
			preload: UPGRADE_WINDOW_PRELOAD_WEBPACK_ENTRY,
		},
		icon: getBrowserWindowIcon(),
	})

	window.removeMenu()

	window.loadURL(getWindowUrl('upgrade_window'))

	applyContextMenu(window)
	applyExternalLinkHandler(window)
	applyZoom(window)

	window.on('ready-to-show', () => {
		window.show()
	})

	return window
}
