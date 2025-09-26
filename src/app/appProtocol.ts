/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { app, net, protocol } from 'electron'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import packageJson from '../../package.json'
import { DEV_SERVER_ORIGIN } from '../constants.js'
import { osTitle } from './system.utils.ts'
import { isInternalUrl } from './utils.ts'

const USER_AGENT = `Mozilla/5.0 (${osTitle}) Nextcloud-Talk v${packageJson.version}`

// Note: connecting to servers over http:// is not supported at the moment
// Adding http:// support is doable
// But it doesn't make much sense, as it is insecure and audio/video calls are not supported in the web client

protocol.registerSchemesAsPrivileged([
	{
		scheme: 'https',
		privileges: {
			// Follow RFC 3986 URI standard (like HTTPS does)
			standard: true,
			// Enable API allowed only for secure contexts
			secure: true,
			// Allow fetch from the main process
			supportFetchAPI: true,
			// Enable V8 code cache
			codeCache: true,
			// Enable registration as stream protocol. Required for playing video streams and downloading large files.
			stream: true,
		},
	},
])

/**
 * Register app protocol handler
 */
export function registerAppProtocolHandler() {
	protocol.handle('https', async (request) => {
		const url = new URL(request.url)

		// Override default Electron's User-Agent
		// Note: it is supposed to work via webRequest.onBeforeSendHeaders (according to the Electron documentation)
		// But for User-Agent header in net.fetch request it does not...
		request.headers.set('User-Agent', USER_AGENT)

		// Handle internal application resource
		if (isInternalUrl(url)) {
			// In development mode proxy requests to the dev server
			if (process.env.NODE_ENV === 'development') {
				return net.fetch(DEV_SERVER_ORIGIN + url.pathname + url.search + url.hash, { bypassCustomProtocolHandlers: true })
			}

			const distPath = getDistPath()
			const requestPath = path.join(distPath, decodeURIComponent(url.pathname))

			// Prevent accessing external files via https://app/../../path/to/external/file
			// Note: it is not supposed to happen with asar package but still better to check
			const relativePath = path.relative(distPath, requestPath)
			if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
				console.warn(`Unsafe path requested: ${requestPath}`)
				return new Response(`Cannot GET ${request.url}`, { status: 404 })
			}

			// Open file://path/to/app/file?query#hash
			return net.fetch(pathToFileURL(requestPath).toString() + url.search + url.hash)
		}

		// Proxy the request to the original destination
		return net.fetch(request, { bypassCustomProtocolHandlers: true })
	})
}

let distPath: string
/**
 * Get cached path to the app dist
 */
function getDistPath() {
	if (!distPath) {
		if (process.env.NODE_ENV === 'development') {
			// In dev mode with Electron Forge + Webpack, static files might be in a different location
			// This could be the webpack output directory or the original static folder
			distPath = path.join(__dirname, '../../.webpack/renderer')
		} else {
			distPath = app.isPackaged
				? path.join(process.resourcesPath, 'app.asar', '.webpack/renderer')
				: path.join(__dirname, '.webpack/renderer')
		}
	}

	return distPath
}
