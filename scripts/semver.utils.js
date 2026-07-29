/*
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Is version A greater than version B?
 *
 * @param {string} versionA - Version A
 * @param {string} versionB - Version B
 * @return {boolean} - Whether version A greater than version B
 */
export function semverGt(versionA, versionB) {
	const normalized = (version) => version.includes('-') ? version : `${version}-z`
	const a = normalized(versionA)
	const b = normalized(versionB)
	return a.localeCompare(b, 'en', { numeric: true }) > 0
}
