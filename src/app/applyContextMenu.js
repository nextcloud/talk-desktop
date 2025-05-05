/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { clipboard, Menu } = require('electron')
const { isExternalUrl } = require('./utils.ts')

/**
 * Enable context menu by right click
 *
 * @param {import('electron').BrowserWindow} browserWindow - Browser window
 */
export function applyContextMenu(browserWindow) {
	browserWindow.webContents.on('context-menu', (event, params) => {
		const menuItems = []

		// Add context actions for misspelling words and typos
		const menuMisspellingItems = [
			...params.dictionarySuggestions.map((suggestion) => ({
				label: suggestion,
				click: () => browserWindow.webContents.replaceMisspelling(suggestion),
			})),
			{ type: 'separator' },
			{
				label: 'Add to dictionary',
				click: () => browserWindow.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord),
			},
			{ type: 'separator' },
		]
		if (params.misspelledWord) {
			menuItems.push(...menuMisspellingItems)
		}

		// Add context actions for handling images
		const menuImageItems = [
			{
				label: 'Copy image',
				click: () => browserWindow.webContents.copyImageAt(params.x, params.y),
			},
			{
				label: 'Save image',
				click: () => browserWindow.webContents.downloadURL(params.srcURL),
			},
			{ type: 'separator' },
		]
		if (params.hasImageContents) {
			menuItems.push(...menuImageItems)
		}

		// Add context actions for handling links
		if (params.linkURL && isExternalUrl(params.linkURL)) {
			const url = params.linkURL
			const text = params.linkText.trim()
			menuItems.push({
				label: 'Copy link address',
				click: () => clipboard.writeText(url),
			})
			if (text) {
				menuItems.push({
					label: 'Copy link text',
					click: () => clipboard.writeText(text),
				})
			}
			if (url.startsWith('mailto:')) {
				menuItems.push({
					label: 'Copy email address',
					click: () => clipboard.writeText(url.slice('mailto:'.length)),
				})
			}
			menuItems.push({ type: 'separator' })
		}

		// Add context actions for clipboard events and text editing
		const menuClipboardItems = [
			{
				role: 'copy',
				enabled: params.selectionText && params.editFlags.canCopy,
			},
			{
				role: 'cut',
				enabled: params.selectionText && params.isEditable && params.editFlags.canCut,
				visible: params.isEditable,
			},
			{
				role: 'selectAll',
				enabled: params.editFlags.canSelectAll,
			},
			{
				role: 'paste',
				enabled: params.isEditable && params.editFlags.canPaste,
				visible: params.isEditable,
			},
			{ type: 'separator' },
		]
		if (params.isEditable || params.selectionText.length) {
			menuItems.push(...menuClipboardItems)
		}

		// TODO Remove or hide from production DevTools toggle before final release
		menuItems.push({ role: 'toggleDevTools' })

		Menu.buildFromTemplate(menuItems).popup()
	})
}
