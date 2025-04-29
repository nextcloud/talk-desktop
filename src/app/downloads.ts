/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { BrowserWindow } from 'electron'

import { Notification, shell } from 'electron'
import path from 'node:path'

/**
 * Suggested filenames for download URLs.
 * In a Web-Browser, "download" attributes is used to suggest a filename for a download URL.
 * Unfortunately, Electron does not support the `download` attribute on anchor tags.
 * And there is no way to set the filename in the webContents.downloadURL API to get it on `will-download` event.
 * It is necessary to keep track of suggested filenames for download URLs manually.
 */
const suggestedNames: Map<string, string> = new Map()

/**
 * Push a suggested filename for a download URL
 *
 * @param url - The URL to suggest a filename for
 * @param filename - The suggested filename
 */
export function pushDownloadUrlFilenameSuggestion(url: string, filename: string) {
	suggestedNames.set(url, filename)
}

/**
 * Get a suggested filename for a download URL and remove it from the list
 *
 * @param url - The URL to pop a suggested filename for
 * @return - The suggested filename if any
 */
function popDownloadUrlFilenameSuggestion(url: string): string | undefined {
	const name = suggestedNames.get(url)
	suggestedNames.delete(url)
	return name
}

/**
 * Trigger a download of a URL
 *
 * @param browserWindow - Browser window to use as a download context
 * @param url - URL to download
 * @param filename - Suggested filename for the download if any, otherwise determined from the URL
 */
export function triggerDownloadUrl(browserWindow: BrowserWindow, url: string, filename?: string) {
	if (filename) {
		pushDownloadUrlFilenameSuggestion(url, filename)
	}
	browserWindow.webContents.downloadURL(url)
}

/**
 * Handle downloads from a browser window to:
 * - show notifications
 * - use suggested filenames
 *
 * @param browserWindow - Browser window
 */
export function applyDownloadHandler(browserWindow: BrowserWindow) {
	browserWindow.webContents.session.on('will-download', (event, item) => {
		const suggestedFilename = popDownloadUrlFilenameSuggestion(item.getURL())
		if (suggestedFilename) {
			item.setSaveDialogOptions({
				defaultPath: suggestedFilename,
			})
		}

		item.once('done', (event, state) => {
			const pathToFile = item.getSavePath()
			const { base, dir } = path.parse(pathToFile)
			let notification

			if (state === 'completed') {
				notification = new Notification({
					title: 'Download complete',
					body: `File '${base}' can be found at '${dir}'.`,
				})
				notification.on('click', () => {
					shell.showItemInFolder(pathToFile)
				})
			} else if (state === 'interrupted') {
				notification = new Notification({
					title: 'Download Failed',
					body: `Something went wrong with the download of '${base}'.`,
				})
			}

			notification?.show()
		})
	})
}
