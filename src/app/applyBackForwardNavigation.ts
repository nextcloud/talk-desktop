/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { BrowserWindow } from 'electron'

/**
 * Apply back and forward shortcuts navigation handling
 *
 * @param window - Browser window
 */
export function applyBackForwardNavigation(window: BrowserWindow) {
	window.webContents.on('before-input-event', (event, input) => {
		const { navigationHistory } = window.webContents

		const isMac = process.platform === 'darwin'
		if (isMac) {
			if (input.meta && input.key === '[' && navigationHistory.canGoBack()) {
				navigationHistory.goBack()
			} else if (input.meta && input.key === ']' && navigationHistory.canGoForward()) {
				navigationHistory.goForward()
			}
		} else {
			if (input.alt && input.key === 'ArrowLeft' && navigationHistory.canGoBack()) {
				navigationHistory.goBack()
			} else if (input.alt && input.key === 'ArrowRight' && navigationHistory.canGoForward()) {
				navigationHistory.goForward()
			}
		}
	})

	// Note: app-command navigation with native Back/Forward buttons work out of the box at the moment of Electron 44
}
