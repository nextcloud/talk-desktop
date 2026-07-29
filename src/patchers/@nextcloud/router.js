/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* eslint-disable jsdoc/require-jsdoc */

import { generateFilePath as _generateFilePath } from '@desktop-modules--@nextcloud/router'

export * from '@desktop-modules--@nextcloud/router'

// TODO: move this handling to the appProtocol handling, so we don't need build-time patching anymore

// By default, Talk requests images and sounds as a file from server assets using generateFilePath
// Desktop app should use path to the local file in the bundle
export function generateFilePath(app, type, file) {
	const filename = file.substring(0, file.lastIndexOf('.'))
	const ext = file.substring(file.lastIndexOf('.'))

	if (app === 'spreed' && type === 'img') {
		// Implicitly keep the extension so Webpack adds only this type of files to the build using require context
		const requiresByExt = {
			'.svg': () => new URL(`@talk/img/${filename}.svg`, import.meta.url),
			'.png': () => new URL(`@talk/img/${filename}.png`, import.meta.url),
			'.jpg': () => new URL(`@talk/img/${filename}.jpg`, import.meta.url),
			'.jpeg': () => new URL(`@talk/img/${filename}.jpeg`, import.meta.url),
			'.webp': () => new URL(`@talk/img/${filename}.webp`, import.meta.url),
			'.gif': () => new URL(`@talk/img/${filename}.gif`, import.meta.url),
			// Note: spreed uses img for both images and sounds
			'.ogg': () => new URL(`@talk/img/${filename}.ogg`, import.meta.url),
		}
		if (requiresByExt[ext]) {
			return requiresByExt[ext]()
		}
	} else if (app === 'notifications' && ext === '.ogg') {
		// For now, notifications' sounds are just a copy of the Notifications app sounds
		return new URL(`../../../sounds/${filename}.ogg`, import.meta.url)
	}

	return _generateFilePath(app, type, file)
}

// Copy of original but using patched generateFilePath
export function imagePath(app, file) {
	if (file.indexOf('.') === -1) {
		return generateFilePath(app, 'img', file + '.svg')
	}

	return generateFilePath(app, 'img', file)
}
