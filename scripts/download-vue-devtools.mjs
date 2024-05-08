/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { request } from 'undici'

import { VUE_DEVTOOLS_EXTENSION_ID } from './vue-devtools-extension-id.mjs'

// TODO: while this is fine to have not exact version here, it's better to get the current version of built-in Chromium in the current version of Electron
const CHROMIUM_VERSION = '122.0.6261.39'

const getChromiumExtensionUrl = (extensionId) => `https://clients2.google.com/service/update2/crx?response=redirect&prod=chromium&prodchannel=unknown&prodversion=${CHROMIUM_VERSION}&acceptformat=crx3&x=id%3D${extensionId}%26installsource%3Dondemand%26uc`

async function downloadChromeExtension(extensionId, outputPath) {
	const url = getChromiumExtensionUrl(extensionId)
	const response = await request(url, { maxRedirections: 10 })
	await pipeline(response.body, createWriteStream(outputPath))
}

async function downloadVueDevtools() {
	const outputPath = new URL('../resources/vue-devtools.crx', import.meta.url)
	await downloadChromeExtension(VUE_DEVTOOLS_EXTENSION_ID, outputPath)
	console.log('✅ Done')
}

await downloadVueDevtools()
