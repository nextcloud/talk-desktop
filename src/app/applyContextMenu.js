/*
 * @copyright Copyright (c) 2023 Maksim Sukharev <antreesy.web@gmail.com>
 *
 * @author Maksim Sukharev <antreesy.web@gmail.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

const { clipboard, Menu } = require('electron')
const { isExternalLink } = require('./externalLinkHandlers.js')

/**
 * Enable context menu by right click
 *
 * @param {import('electron').BrowserWindow} browserWindow - Browser window
 */
export function applyContextMenu(browserWindow) {
	browserWindow.webContents.on('context-menu', (event, params) => {
		let menuItems = [];

		// Add context actions for misspelling words and typos
		const menuMisspellingItems = [
			...params.dictionarySuggestions.map(suggestion => ({
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
		const menuLinkItems = [
			{
				label: 'Copy link address',
				click: () => clipboard.writeText(params.linkURL),
			},
			{
				label: 'Copy link text',
				click: () => clipboard.writeText(params.linkText.trim() || params.linkURL),
			},
			{ type: 'separator' },
		]
		if (params.linkURL && isExternalLink(params.linkURL)) {
			menuItems.push(...menuLinkItems)
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
