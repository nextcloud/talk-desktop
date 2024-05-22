/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { register } from '@nextcloud/l10n'

import { applyBodyThemeAttrs } from './theme.utils.js'
import { appData } from '../app/AppData.js'
import { initGlobals } from './globals/globals.js'

/**
 * @param {string} lang - language code, TS type: `${lang}_${countryCode}`|`${lang}`
 * @param {Function} resolver - function to import the translation bundle by language code,
 *                              for example, (lang) => import(`path/to/l10n/${lang}.json`)
 * @return {Promise<null|object>} - translation bundle or null if not found
 */
async function tryLoadL10n(lang, resolver) {
	try {
		const { default: translationBundle } = await resolver(lang)
		return translationBundle.translations
	} catch (e) {
		if (lang.includes('_')) {
			// Try to load locale without country code
			return tryLoadL10n(lang.split('_')[0], resolver)
		}
		return null
	}
}

/**
 * @param {string} app - application to register translation bundles for
 * @param {string} lang - language code, TS type: `${lang}_${countryCode}`|`${lang}`
 * @param {Function} resolver - function to import the translation bundle by language code,
 *                              for example, (lang) => import(`path/to/l10n/${lang}.json`)
 */
async function loadAndRegisterL10n(app, lang, resolver) {
	const mayBeTranslations = await tryLoadL10n(lang, resolver)
	if (mayBeTranslations) {
		register(app, mayBeTranslations)
		console.log(`Language pack "${lang}" for "${app}" loaded...`)
	} else {
		console.log(`Language pack "${lang}" for "${app}" not found...`)
	}
}

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
		await Promise.all([
			loadAndRegisterL10n('spreed', language, (lang) => import(`@talk/l10n/${lang}.json`)),
			loadAndRegisterL10n('talk_desktop', language, (lang) => import(`../../l10n/${lang}.json`)),
		])
	}
}

/**
 * Apply user data to the document attributes and global variables that can be then used by @nextcloud/auth
 * @return {void}
 */
async function applyUserData() {
	if (!appData.userMetadata) {
		return
	}

	// getCurrentUser().uid
	document.head.setAttribute('data-user', appData.userMetadata.id)

	// getCurrentUser().displayName
	// Current user metadata had different property name for display name than userMetadata
	// Remove if Nextcloud 27 is not supported
	// @see https://github.com/nextcloud/server/pull/36665
	document.head.setAttribute('data-user-displayname', appData.userMetadata.displayname ?? appData.userMetadata['display-name'])

	// getCurrentUser().isAdmin
	window._oc_isadmin = appData.userMetadata.groups.includes('admin')
}

/**
 * Make all required initial setup for the web page:
 * - set title according to app name
 * - restore app data
 * - get OS info
 * - apply theme to HTML data-attrs
 * - apply locale to HTML lang and data-locale attrs
 * - register translation bundles for Talk and Talk Desktop
 */
export async function setupWebPage() {
	document.title = await window.TALK_DESKTOP.getAppName()
	initGlobals()
	appData.restore()
	window.OS = await window.TALK_DESKTOP.getOs()
	applyUserData()
	applyBodyThemeAttrs()
	await applyL10n()
}
