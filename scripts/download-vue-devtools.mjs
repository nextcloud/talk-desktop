/*
 * @copyright Copyright (c) 2024 Grigorii Shartsev <me@shgk.me>
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
