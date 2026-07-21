/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { app, session } from 'electron'
import fs from 'node:fs/promises'
import { resolve } from 'node:path'
import unzip from 'unzip-crx-3'

const vueDevtoolsPath = resolve(import.meta.dirname, require('../resources/vue-devtools.crx'))

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
export async function installVueDevtools() {
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
