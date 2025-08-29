/*
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const crypto = require('node:crypto')

const DNS_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

/**
 * Generate UUID v5
 *
 * @param {string} name - Input string
 * @param {string} namespace - Namespace UUID (e.g., '6ba7b810-9dad-11d1-80b4-00c04fd430c8')
 * @return {string} UUIDv5
 */
function UUIDv5(name, namespace = DNS_NAMESPACE) {
	const namespaceBytes = Buffer.from(namespace.replace(/-/g, ''), 'hex')

	const hash = crypto.createHash('sha1')
	hash.update(namespaceBytes)
	hash.update(name, 'utf8')

	const uuid = Array.from(hash.digest().slice(0, 16))

	// Version byte (bits 4-7) - must be 5 (0b0101)
	uuid[6] = (uuid[6] & 0b00001111) | 0b01010000
	// Variant byte (bits 6-7) - must be 2 (0b10) for RFC 4122 compliance
	uuid[8] = (uuid[8] & 0b00111111) | 0b10000000

	const hex = uuid.map((byte) => byte.toString(16).padStart(2, '0')).join('')
	return [
		hex.slice(0, 8),
		hex.slice(8, 12),
		hex.slice(12, 16),
		hex.slice(16, 20),
		hex.slice(20, 32),
	].join('-')
}

module.exports = {
	UUIDv5,
}
