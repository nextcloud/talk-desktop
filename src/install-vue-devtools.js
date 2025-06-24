/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { app, session } = require('electron')
const fs = require('node:fs/promises')
const { resolve } = require('node:path')
const unzip = require('unzip-crx-3')

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
	const extensionDir = resolve(app.getPath('userData'), 'extensions', 'vuejs-devtools')

	try {
		// Check if there is uncleaned unpacked extensions from the previous installation
		if (await isDirectoryExists(extensionDir)) {
			await fs.rm(extensionDir, { recursive: true })
		}

		await fs.mkdir(extensionDir)
		await unzip(vueDevtoolsPath, extensionDir)
		await session.defaultSession.extensions.loadExtension(extensionDir)

		console.log('Vue Devtools extension is installed')
	} catch (error) {
		console.error('Could not install Vue Devtools', error)
	}
}

module.exports = {
	installVueDevtools,
}
