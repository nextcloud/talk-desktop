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
		if (input.type !== 'keyDown') {
			return
		}

		let direction: 'back' | 'forward' | undefined

		const isMac = process.platform === 'darwin'
		if (isMac) {
			if (input.meta && input.key === '[') {
				direction = 'back'
			} else if (input.meta && input.key === ']') {
				direction = 'forward'
			}
		} else {
			if (input.alt && input.key === 'ArrowLeft') {
				direction = 'back'
			} else if (input.alt && input.key === 'ArrowRight') {
				direction = 'forward'
			}
		}

		// Prevent default for future-proofing in case Electron adds default navigation or other actions on the same shortcut (it was a case in the past)

		const { navigationHistory } = window.webContents
		if (direction === 'back' && navigationHistory.canGoBack()) {
			event.preventDefault()
			navigationHistory.goBack()
		} else if (direction === 'forward' && navigationHistory.canGoForward()) {
			event.preventDefault()
			navigationHistory.goForward()
		}
	})

	// Note: app-command navigation with native Back/Forward buttons work out of the box at the moment of Electron 44
}
