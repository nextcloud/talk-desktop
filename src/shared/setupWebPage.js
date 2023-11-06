/*
 * @copyright Copyright (c) 2023 Grigorii Shartsev <me@shgk.me>
 *
 * @author Grigorii Shartsev <me@shgk.me>
 *
 * @license AGPL-3.0-or-later
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

import { applyBodyThemeAttrs } from './theme.utils.js'
import { appData } from '../app/AppData.js'
import { register } from '@nextcloud/l10n'

/**
 * Apply locale to the document attributes, used by @nextcloud/l10n,
 * and register translation bundles for Talk and Talk Desktop.
 *
 * @return {Promise<void>}
 */
async function applyL10n() {
	const { language, locale } = appData.userMetadata ?? await window.TALK_DESKTOP.getSystemL10n()

	document.documentElement.lang = language
	document.documentElement.dataset.locale = locale

	console.log(`Using locale "${locale}" for language "${language}"`)

	if (language !== 'en') {
		try {
			const { default: translationBundle } = await import(`@talk/l10n/${language}.json`)
			register('spreed', translationBundle.translations)
		} catch (e) {
			console.log(`Language pack "${language}" for spreed not found...`)
		}

		try {
			const { default: translationBundle } = await import(`../../l10n/${language}.json`)
			register('talk_desktop', translationBundle.translations)
		} catch (e) {
			console.log(`Language pack "${language}" for talk_desktop not found...`)
		}
	}
}

/**
 * Make all required initial setup for the web page:
 * - restore app data
 * - get OS info
 * - apply theme to HTML data-attrs
 * - apply locale to HTML lang and data-locale attrs
 * - register translation bundles for Talk and Talk Desktop
 */
export async function setupWebPage() {
	appData.restore()
	window.OS = await window.TALK_DESKTOP.getOs()
	applyBodyThemeAttrs()
	await applyL10n()
}
