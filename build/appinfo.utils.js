/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * @typedef {object} AppInfo
 * @property {number} minVersion
 * @property {number} maxVersion
 */

/**
 * Read the content of the appinfo/info.xml file in an app
 *
 * @param {string} dir - path to the app directory
 * @return {string} - the content of the file
 */
export function readAppInfoContent(dir) {
	return readFileSync(join(dir, 'appinfo/info.xml'), 'utf-8')
}

/**
 * Particularly parse the app info from the content of the appinfo/info.xml file
 *
 * @param {string} content - the content of the appinfo/info.xml file
 * @return {AppInfo|null} - the parsed app info object
 */
export function parseAppInfo(content) {
	const versionsRE = /<nextcloud\s+min-version="(\d+)"\s+max-version="(\d+)"\s*\/>/im
	const versions = content.match(versionsRE)

	if (!versions) {
		return null
	}

	return {
		minVersion: parseInt(versions[1]),
		maxVersion: parseInt(versions[2]),
	}
}

/**
 * Get the app info from the appinfo/info.xml file
 *
 * @param {string} dir - The directory of the app with appinfo
 * @return {AppInfo|null} - The app info object
 */
export function getAppInfo(dir) {
	const content = readAppInfoContent(dir)
	return parseAppInfo(content)
}
