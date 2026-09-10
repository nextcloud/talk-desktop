/**
 * SPDX-FileCopyrightText: 2026 Krateos BV
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { resolveBuildConfig } = require('./resolveBuildConfig.js')

const BUILD_CONFIG = resolveBuildConfig()

/**
 * Display strings in Talk's (spreed's) source that carry the upstream product name but
 * never pass through `t()`, so the l10n patcher cannot reach them.
 *
 * Deliberately an explicit allow-list rather than a blanket find-and-replace over spreed's
 * source. A general transform would also rewrite "Nextcloud GmbH" inside the SPDX
 * copyright headers every file carries - falsifying an upstream copyright notice, which
 * is a licensing violation in the opposite direction from the one we are fixing here.
 *
 * Each entry must be a literal that is rendered to the user.
 */
const LITERAL_REPLACEMENTS = [
	{
		// matterbridgeTypes.nctalk.name - rendered by BridgePart.vue ({{ type.name }})
		// and MatterbridgeSettings.vue (displayName), never translated.
		file: /components[\\/]ConversationSettings[\\/]Matterbridge[\\/]matterbridgeTypes\.ts$/,
		from: /name: 'Nextcloud Talk'/g,
		to: (applicationName) => `name: '${applicationName}'`,
	},
]

/**
 * Webpack loader that rebrands the few user-visible plain-string literals in spreed's
 * source that the runtime l10n patcher cannot cover.
 *
 * No-op on unbranded builds.
 *
 * @param {string} source - Module source
 * @return {string} Possibly rebranded source
 */
module.exports = function spreedLiteralRebrandLoader(source) {
	this.cacheable?.(true)

	if (!BUILD_CONFIG.isBranded) {
		return source
	}

	const resourcePath = this.resourcePath ?? ''
	let result = source

	for (const { file, from, to } of LITERAL_REPLACEMENTS) {
		if (file.test(resourcePath)) {
			result = result.replace(from, to(BUILD_CONFIG.applicationName))
		}
	}

	return result
}

module.exports.LITERAL_REPLACEMENTS = LITERAL_REPLACEMENTS
