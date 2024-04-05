/*
 * @copyright Copyright (c) 2023 Grigorii Shartsev <me@shgk.me>
 *
 * @author Grigorii Shartsev <me@shgk.me>
 *
 * @license AGPL-3.0-or-later
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

const { resolve } = require('node:path')
const fs = require('node:fs/promises')
const { app, session } = require('electron')
const unzip = require('unzip-crx-3')

const { VUE_DEVTOOLS_EXTENSION_ID } = require('../scripts/vue-devtools-extension-id.mjs')

const vueDevtoolsPath = resolve(__dirname, require('../resources/vue-devtools.crx'))
/**
 * Check if a directory exists
 *
 * @param {string} path - path to directory
 * @return {Promise<boolean>} - true if directory exists
 */
async function isDirectoryExists(path) {
	try {
		const stat = await fs.stat(path)
		return stat.isDirectory()
	} catch (err) {
		if (err.code === 'ENOENT') {
			return false
		}
		throw err
	}
}

/**
 * Install Vue Devtools extension
 *
 * @return {Promise<void>}
 */
async function installVueDevtools() {
	if (session.defaultSession.getExtension(VUE_DEVTOOLS_EXTENSION_ID)) {
		console.log('Vue Devtools extension has already been installed')
		return
	}

	const extensionDir = resolve(app.getPath('userData'), 'extensions', 'vuejs-devtools')

	// TODO: add version check to enable vue-devtools updating
	const isExtensionUnpacked = await isDirectoryExists(extensionDir)
	if (!isExtensionUnpacked) {
		await unzip(vueDevtoolsPath, extensionDir)
		console.log('Vue Devtools extension is unpacked')
	}

	await session.defaultSession.loadExtension(extensionDir)

	console.log('Vue Devtools extension is installed')
}

module.exports = {
	installVueDevtools,
}
