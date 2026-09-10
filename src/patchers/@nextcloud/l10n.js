/**
 * SPDX-FileCopyrightText: 2026 Krateos BV
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* eslint-disable jsdoc/require-jsdoc */

import {
	n as _n,
	t as _t,
	translate as _translate,
	translatePlural as _translatePlural,
} from '@desktop-modules--@nextcloud/l10n'
import { rebrandText, vendorNameFrom } from '../../../build/rebrandText.js'
import { BUILD_CONFIG } from '../../shared/build.config.ts'

export * from '@desktop-modules--@nextcloud/l10n'

/**
 * Strip upstream Nextcloud branding out of every translated string.
 *
 * Talk Desktop bundles Talk's (spreed's) own translation catalogs, whose changelog and
 * welcome-conversation copy is full of "Nextcloud Talk". Rewriting those catalogs alone
 * is not enough: `t()` falls back to its English source argument whenever a lookup
 * misses, which is exactly what happens on an English locale, so the upstream name would
 * still reach the UI.
 *
 * So both ends are rebranded here:
 *  - the *source string* is rebranded before lookup, which lets build/l10n-rebrand-loader.js
 *    rewrite catalog keys as well as values (keeping the upstream name out of the shipped
 *    bundles) while still resolving to the real translation, and makes the
 *    no-catalog English path correct by construction;
 *  - the *result* is rebranded too, covering any translated value that slipped through.
 *
 * This is the single choke point every caller in both codebases goes through.
 * URLs are deliberately preserved - see build/rebrandText.js.
 *
 * No-op on unbranded builds, so upstream behaviour is untouched.
 */
const APPLICATION_NAME = BUILD_CONFIG.applicationName
const VENDOR_NAME = vendorNameFrom(APPLICATION_NAME)

function rebrand(text) {
	return rebrandText(text, APPLICATION_NAME, VENDOR_NAME)
}

/**
 * Rebrand the given argument positions, then rebrand whatever comes back.
 *
 * @param {(...args: unknown[]) => string} fn - Upstream translation function
 * @param {number[]} textArgIndexes - Positions of translatable source strings
 * @return {(...args: unknown[]) => string} Patched function
 */
function patchTranslation(fn, textArgIndexes) {
	return (...args) => {
		if (!BUILD_CONFIG.isBranded) {
			return fn(...args)
		}

		for (const index of textArgIndexes) {
			if (typeof args[index] === 'string') {
				args[index] = rebrand(args[index])
			}
		}

		return rebrand(fn(...args))
	}
}

// t(app, text, vars?, count?, options?)
export const t = patchTranslation(_t, [1])
export const translate = patchTranslation(_translate, [1])

// n(app, textSingular, textPlural, count, vars?, options?)
export const n = patchTranslation(_n, [1, 2])
export const translatePlural = patchTranslation(_translatePlural, [1, 2])
