/*
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Parse Electron certificate fingerprint to algorithm and HEX formatted value,
 * fallbacks to original value
 *
 * @param fingerprint - Electron certificate fingerprint
 * @return
 */
export function parseElectronCertificateFingerprint(fingerprint: string): { algorithm: string, value: string } {
	// As of Electron 36, the fingerprint is always sha256 hash in a format
	// sha256/{base64_hash}
	// e.g.: sha256/4x/KdLUpgXuIZSZ3eQJEJj2o+7k93uqObHxp2XPbZHY=
	const [isMatched, algorithm, value] = fingerprint.match(/^(.+?)\/(.+)$/) ?? []

	if (isMatched) {
		return {
			algorithm: algorithm.toUpperCase(),
			value: base64ToHex(value),
		}
	}
	return {
		algorithm: 'UNKNOWN',
		value: fingerprint,
	}
}

/**
 * Convert base64 string to HEX formatted string
 *
 * @param base64 - base64 string
 * @return HEX formatted string, e.g., 61 94 32 22 40 D5 39 9C E5 B7 C6 87 A2 BC 8E 2E 6A 6C 76 79 55 1C 3F DA 96 A9 49 02 5A 55 A7 D0
 */
function base64ToHex(base64: string): string {
	try {
		const hex: string[] = []
		const bin = atob(base64)
		for (let i = 0; i < bin.length; i++) {
			hex.push(bin.charCodeAt(i).toString(16).padStart(2, '0').toUpperCase())
		}
		return hex.join(' ')
	} catch {
		return ''
	}
}
