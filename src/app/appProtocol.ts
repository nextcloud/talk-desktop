/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { app, protocol, net } from 'electron'
import { APP_PROTOCOL, APP_HOST, DEV_SERVER_ORIGIN } from '../constants.js'

protocol.registerSchemesAsPrivileged([
	{
		scheme: APP_PROTOCOL,
		privileges: {
			standard: true,
			secure: true,
			allowServiceWorkers: true,
			supportFetchAPI: true,
			corsEnabled: true,
		},
	},
])

/**
 * Register app protocol handler
 */
export function registerAppProtocolHandler() {
	protocol.handle(APP_PROTOCOL, async (request) => {
		const url = new URL(request.url)
		const fullpath = (url.pathname + url.search + url.hash).slice(1)

		// Redirect nctalk://call/{token} links to the app
		if (url.host === 'call') {
			return new Response(null, {
				status: 302,
				headers: {
					Location: `${APP_PROTOCOL}://${APP_HOST}/talk_window/index.html#/call/${fullpath}`,
				},
			})
		}

		// Handle in-app links
		if (url.host === APP_HOST) {
			// In development mode proxy requests to the dev server
			if (process.env.NODE_ENV === 'development') {
				const urlOnDevServer = new URL(fullpath, DEV_SERVER_ORIGIN)
				return await fetch(urlOnDevServer)
			}

			const distPath = getDistPath()

			const requestPath = path.join(distPath, decodeURIComponent(url.pathname))

			// Prevent accessing external files via nctalk://app/../../path/to/external/file
			// Note: it is not supposed to happen with asar package but still better to check
			const relativePath = path.relative(distPath, requestPath)
			if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
				console.warn(`Unsafe path requested: ${requestPath}`)
				return new Response(`Cannot GET ${request.url}`, { status: 404 })
			}

			// Generate file://path/to/app/file?query URL
			const urlToFile = pathToFileURL(requestPath)
			return net.fetch(urlToFile.toString() + url.search + url.hash)
		}

		// API reverse proxy
		if (url.host === 'api') {
			return net.fetch(fullpath, {
				method: request.method,
				headers: request.headers,
				body: request.body,
				credentials: 'include',
				// @ts-expect-error Untyped custom property from Electron
				duplex: 'half',
			})
		}

		// Unknown host
		console.warn('Unknown application host:', url.host)
		return new Response(`Cannot GET ${request.url}`, { status: 404 })
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
