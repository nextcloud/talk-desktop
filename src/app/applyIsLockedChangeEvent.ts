/*!
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { BrowserWindow } from 'electron'
import { powerMonitor } from 'electron'

/**
 * Trigger 'app:isLocked:change' event when the system is locked or unlocked.
 * Only available on Windows and macOS.
 *
 * @param window - BrowserWindow
 */
export function applyIsLockedChangeEvent(window: BrowserWindow) {
	const sendIsLockedChangeToTrue = () => window.webContents.send('app:isLocked:change', true)
	const sendIsLockedChangeToFalse = () => window.webContents.send('app:isLocked:change', false)

	window.on('ready-to-show', () => {
		powerMonitor.on('lock-screen', sendIsLockedChangeToTrue)
		powerMonitor.on('unlock-screen', sendIsLockedChangeToFalse)
	})

	window.on('closed', () => {
		powerMonitor.off('lock-screen', sendIsLockedChangeToTrue)
		powerMonitor.off('unlock-screen', sendIsLockedChangeToFalse)
	})
}
