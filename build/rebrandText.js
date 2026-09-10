/**
 * SPDX-FileCopyrightText: 2026 Krateos BV
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Dependency-free on purpose: this module is imported by the renderer bundle
// (src/patchers/@nextcloud/l10n.js) as well as by build-time tooling, so it must not
// pull in node:fs via resolveBuildConfig.

// Upstream names, longest first so "Nextcloud Talk" is consumed before "Nextcloud".
const UPSTREAM_APPLICATION_NAME = 'Nextcloud Talk'
const UPSTREAM_VENDOR_NAME = 'Nextcloud'

/**
 * Anything that looks like a URL or a bare domain.
 *
 * Occurrences of "nextcloud" inside these are left untouched: they are real links to
 * genuine Nextcloud resources (docs, GitHub, the App Store). Rewriting them would break
 * the link, and naming an upstream project in a link is nominative use — it is not
 * passing our product off as theirs.
 */
const URL_LIKE = /(?:[a-z][a-z0-9+.-]*:\/\/|www\.)[^\s)<>"']+|[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|org|net|io|eu|dev|help)\b/gi

/**
 * Replace upstream product/vendor names outside of URLs.
 *
 * Idempotent: rebranded text contains no "Nextcloud", so re-applying is a no-op. That
 * matters because both the build-time loader and the runtime l10n patcher run this.
 *
 * @param {string} text - Text to rebrand
 * @param {string} applicationName - Replacement for "Nextcloud Talk", e.g. "Xenia Talk"
 * @param {string} vendorName - Replacement for a standalone "Nextcloud", e.g. "Xenia"
 * @return {string} Rebranded text
 */
function rebrandText(text, applicationName, vendorName) {
	if (typeof text !== 'string' || !text.includes(UPSTREAM_VENDOR_NAME)) {
		return text
	}

	const replaceOutsideUrls = (segment) => segment
		.split(UPSTREAM_APPLICATION_NAME).join(applicationName)
		.split(UPSTREAM_VENDOR_NAME).join(vendorName)

	let result = ''
	let lastIndex = 0

	for (const match of text.matchAll(URL_LIKE)) {
		result += replaceOutsideUrls(text.slice(lastIndex, match.index))
		// Preserve the URL verbatim
		result += match[0]
		lastIndex = match.index + match[0].length
	}
	result += replaceOutsideUrls(text.slice(lastIndex))

	return result
}

/**
 * Derive the vendor name from the application name: "Xenia Talk" -> "Xenia".
 *
 * @param {string} applicationName - Branded application name
 * @return {string} Vendor name
 */
function vendorNameFrom(applicationName) {
	return applicationName.split(' ')[0] || applicationName
}

module.exports = { rebrandText, vendorNameFrom }
