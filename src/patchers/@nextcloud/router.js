/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* eslint-disable jsdoc/require-jsdoc */

import {
	getRootUrl as _getRootUrl,
	getAppRootUrl as _getAppRootUrl,
	generateUrl as _generateUrl,
	linkTo as _linkTo,
	generateRemoteUrl as _generateRemoteUrl,
	generateOcsUrl as _generateOcsUrl,
	generateFilePath as _generateFilePath,
} from '@desktop-modules--@nextcloud/router'

// Original @nextcloud/router sometimes relies on window.location which is not correct on desktop
// So, some function must be re-defined or patched

// Works as expected originally, does not use location
export const getRootUrl = _getRootUrl

// Works fine originally with enabled absolute webroot
export const getAppRootUrl = (...args) => window.OCA.Talk.Desktop.runWithAbsoluteWebroot(_getAppRootUrl, ...args)
export const generateUrl = (...args) => window.OCA.Talk.Desktop.runWithAbsoluteWebroot(_generateUrl, ...args)
export const linkTo = (...args) => window.OCA.Talk.Desktop.runWithAbsoluteWebroot(_linkTo, ...args)

// Original getBaseUrl relies on window.location, create a new one as an absolute version of getRootUrl
export const getBaseUrl = (...args) => window.OCA.Talk.Desktop.runWithAbsoluteWebroot(_getRootUrl, ...args)

// Requires changing the default options.baseUrl from original relative getBaseUrl to new absolute getBaseUrl
export const generateRemoteUrl = (service, options = {}) => _generateRemoteUrl(service, { ...options, baseURL: options.baseURL || getBaseUrl() })
export const generateOcsUrl = (url, params, options = {}) => _generateOcsUrl(url, params, { ...options, baseURL: options.baseURL || getBaseUrl() })

// By default, Talk requests images and sounds as a file from server assets using generateFilePath
// Desktop app should use path to the local file in the bundle
export function generateFilePath(app, type, file) {
	const filename = file.substring(0, file.lastIndexOf('.'))
	const ext = file.substring(file.lastIndexOf('.'))

	if (app === 'spreed' && type === 'img') {
		// Implicitly keep the extension so Webpack adds only this type of files to the build using require context
		const requiresByExt = {
			'.svg': () => require(`@talk/img/${filename}.svg`),
			'.png': () => require(`@talk/img/${filename}.png`),
			'.jpg': () => require(`@talk/img/${filename}.jpg`),
			'.jpeg': () => require(`@talk/img/${filename}.jpeg`),
			'.webp': () => require(`@talk/img/${filename}.webp`),
			'.gif': () => require(`@talk/img/${filename}.gif`),
			// Note: spreed uses img for both images and sounds
			'.ogg': () => require(`@talk/img/${filename}.ogg`),
		}
		if (requiresByExt[ext]) {
			return requiresByExt[ext]()
		}
	} else if (app === 'notifications' && ext === '.ogg') {
		// For now, notifications' sounds are just a copy of the Notifications app sounds
		return require(`../../../sounds/${filename}.ogg`)
	}

	return window.OCA.Talk.Desktop.runWithAbsoluteWebroot(() => _generateFilePath(app, type, file))
}

// Copy of original but using patched generateFilePath
export function imagePath(app, file) {
	if (file.indexOf('.') === -1) {
		return generateFilePath(app, 'img', file + '.svg')
	}

	return generateFilePath(app, 'img', file)
}
