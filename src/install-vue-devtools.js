/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
