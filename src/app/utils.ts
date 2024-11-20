/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { IpcMainEvent } from 'electron'
import { BrowserWindow, ipcMain, screen } from 'electron'
import { getAppConfig } from './AppConfig.ts'

/**
 * Get the scaled window size based on the current zoom factor
 * @param width - Base window width
 * @param height - Base window height
 * @param limit - Limit the window size to the screen size
 */
export function getScaledWindowSize({ width, height }: { width: number, height: number }, limit = true) {
	const zoomFactor = getAppConfig('zoomFactor')

	const windowWidth = Math.round(width * zoomFactor)
	const windowHeight = Math.round(height * zoomFactor)

	if (limit) {
		const primaryDisplay = screen.getPrimaryDisplay()
		const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

		return {
			width: Math.min(windowWidth, screenWidth),
			height: Math.min(windowHeight, screenHeight),
		}
	}

	return {
		width: windowWidth,
		height: windowHeight,
	}
}

/**
 * Get the scaled window minimum size based on the current zoom factor
 * @param minWidth - Base window minimum width
 * @param minWeight - Base window minimum height
 * @param limit - Limit the window size to the screen size
 */
export function getScaledWindowMinSize({ minWidth, minHeight }: { minWidth: number, minHeight: number }, limit = true) {
	const { width, height } = getScaledWindowSize({ width: minWidth, height: minHeight }, limit)
	return {
		minWidth: width,
		minHeight: height,
	}
}

/**
 * Memoized promises of waitWindowMarkedReady.
 * Using WeakMap so that the promises are garbage collected when the window is destroyed.
 */
const windowMarkedReadyPromises = new WeakMap<BrowserWindow, Promise<void>>()

/**
 * Wait for the window to be marked as ready to show by its renderer process
 * @param window - BrowserWindow
 */
export function waitWindowMarkedReady(window: BrowserWindow): Promise<void> {
	// As a window is marked ready only once.
	// Awaiting promise is memoized to allow multiple calls and calls on a ready window.

	if (windowMarkedReadyPromises.has(window)) {
		return windowMarkedReadyPromises.get(window)!
	}

	const promise: Promise<void> = new Promise((resolve) => {
		const handleMarkWindowReady = (event: IpcMainEvent) => {
			if (event.sender === window.webContents) {
				ipcMain.removeListener('app:markWindowReady', handleMarkWindowReady)
				resolve()
			}
		}
		ipcMain.on('app:markWindowReady', handleMarkWindowReady)
	})

	windowMarkedReadyPromises.set(window, promise)

	return promise
}

/**
 * Show the window when it is marked as ready to show its renderer process
 * @param window - The BrowserWindow
 */
export async function showWhenWindowMarkedReady(window: BrowserWindow): Promise<void> {
	if (window.isVisible()) {
		return
	}
	await waitWindowMarkedReady(window)
	window.show()
}
