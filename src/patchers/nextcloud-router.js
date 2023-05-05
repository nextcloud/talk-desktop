/*
 * @copyright Copyright (c) 2022 Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
 *
 * @author Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
 *
 * @license GNU AGPL version 3 or any later version
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

/* eslint-disable jsdoc/require-jsdoc */

import { getRootUrl, generateFilePath as _generateFilePath } from '../../node_modules/@nextcloud/router/dist/index.js'

export { linkTo, getRootUrl, generateUrl } from '../../node_modules/@nextcloud/router/dist/index.js'

/**
 * @param {string} s - String with "{token}" blocks
 * @param {Object<string,string>} [tokens] - Dict with replacements
 * @return {string}
 */
function formattedString(s, tokens = {}) {
	return Object.entries(tokens).reduce((acc, [token, replacement]) => acc.replaceAll(`{${token}}`, replacement), s)
}

export function generateOcsUrl(url, params = {}, options = {}) {
	// Reason to patch: it uses window.location
	const allOptions = { ...options, ocsVersion: 2 }
	const version = (allOptions.ocsVersion === 1) ? 1 : 2
	return `${getRootUrl()}/ocs/v${version}.php/${formattedString(url, params)}`
}

const linkToRemoteBase = (service) => getRootUrl() + '/remote.php/' + service

export function generateRemoteUrl(service) {
	// Reason to patch: it uses window.location
	return linkToRemoteBase(service)
}

export function generateFilePath(app, type, file) {
	/**
	 * By default, Talk requests images and sounds as a file from server assets using generateFilePath
	 * Desktop app should use path to the local file in the build
	 */

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
			// Note: spreed uses img for both images and sounds
			'.ogg': () => require(`@talk/img/${filename}.ogg`),
		}
		if (requiresByExt[ext]) {
			return requiresByExt[ext]()
		}
	} else if (app === 'notifications' && ext === '.ogg') {
		// For now notifications sounds are just a copy of the notifications app sounds
		return require(`../../sounds/${filename}.ogg`)
	}

	return _generateFilePath(app, type, file)
}

// Copy of original function, but using patched generateFilePath
export function imagePath(app, file) {
	if (file.indexOf('.') === -1) {
		return generateFilePath(app, 'img', file + '.svg')
	}

	return generateFilePath(app, 'img', file)
}
