/**
 * SPDX-FileCopyrightText: 2026 Krateos BV
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { rebrandText, vendorNameFrom } = require('./rebrandText.js')
const { resolveBuildConfig } = require('./resolveBuildConfig.js')

const BUILD_CONFIG = resolveBuildConfig()

/**
 * Webpack loader that strips upstream Nextcloud branding out of bundled translation
 * catalogs.
 *
 * Talk Desktop bundles Talk's (spreed's) own l10n JSON, whose changelog and
 * welcome-conversation copy carries "Nextcloud Talk" throughout. Without this those
 * strings sit inside the shipped artifact of a rebranded product.
 *
 * Both keys and values are rewritten, so the upstream name is not left sitting in the
 * shipped catalogs as a lookup key. That is only safe because the runtime patcher in
 * src/patchers/@nextcloud/l10n.js rebrands the source string before looking it up, so a
 * `t('spreed', 'Nextcloud Talk ...')` call in the (unmodified) upstream source still
 * resolves against the rebranded key and keeps its real translation.
 *
 * Implemented as a loader rather than by editing the spreed checkout so the upstream
 * working copy stays pristine and this survives upstream syncs.
 *
 * No-op on unbranded builds.
 *
 * @param {string} source - JSON source
 * @return {string} Rebranded JSON source
 */
module.exports = function l10nRebrandLoader(source) {
	this.cacheable?.(true)

	if (!BUILD_CONFIG.isBranded) {
		return source
	}

	const applicationName = BUILD_CONFIG.applicationName
	const vendorName = vendorNameFrom(applicationName)

	const bundle = JSON.parse(source)

	if (bundle && typeof bundle.translations === 'object' && bundle.translations !== null) {
		bundle.translations = Object.fromEntries(Object.entries(bundle.translations).map(([key, value]) => [
			rebrandText(key, applicationName, vendorName),
			Array.isArray(value)
			// Plural forms
				? value.map((form) => rebrandText(form, applicationName, vendorName))
				: rebrandText(value, applicationName, vendorName),
		]))
	}

	return JSON.stringify(bundle)
}
