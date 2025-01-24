/*
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Is version A greater than version B?
 * @param {string} versionA - Version A
 * @param {string} versionB - Version B
 * @return {boolean} - Whether version A greater than version B
 */
export function semverGt(versionA, versionB) {
	const parse = (v) => [...v.split('-')[0].split('.').map((v) => parseInt(v)), v.split('-')[1] || 'z']
	const a = parse(versionA)
	const b = parse(versionB)
	for (let i = 0; i < a.length; i++) {
		if (a[i] > b[i]) {
			return true
		} else if (a[i] < b[i]) {
			return false
		}
	}
	return false
}
