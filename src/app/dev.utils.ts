/*
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { BrowserWindow } from 'electron'

/**
 * Open chrome://webrtc-internals
 */
export function openChromeWebRtcInternals() {
	openChromeInternalPage('webrtc-internals')
}

/**
 * Windows cache to prevent opening multiple windows for the same internal page
 */
const windows: Record<string, BrowserWindow> = {}

/**
 * Open a Chrome internal page as a single window
 *
 * @param page - Internal page to open
 */
function openChromeInternalPage(page: 'webrtc-internals' | 'webrtc-logs') {
	if (windows[page]) {
		windows[page].focus()
		return
	}

	windows[page] = new BrowserWindow()
	windows[page].loadURL(`chrome://${page}`)
	windows[page].on('closed', () => {
		delete windows[page]
	})
}
