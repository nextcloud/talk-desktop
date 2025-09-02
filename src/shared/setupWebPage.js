/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import axios from '@nextcloud/axios'
import { isRTL, register } from '@nextcloud/l10n'
import { appData } from '../app/AppData.js'
import { refetchAppData } from '../app/appData.service.js'
import { TITLE_BAR_HEIGHT } from '../constants.js'
import { initAppConfig } from './appConfig.service.ts'
import { initGlobals } from './globals/globals.js'
import { setupInitialState } from './initialState.service.js'

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
	} catch {
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
	const { language: systemLanguage, locale: systemLocale } = await window.TALK_DESKTOP.getSystemL10n()
	const language = appData.userMetadata?.language || systemLanguage
	const locale = appData.userMetadata?.locale || systemLocale

	const canonicalLanguage = language.replaceAll('_', '-')

	document.documentElement.lang = canonicalLanguage
	document.documentElement.dataset.locale = locale

	console.info(`Using locale "${locale}" for language "${language}"`)

	if (language !== 'en') {
		await Promise.all([
			loadAndRegisterL10n('spreed', language, (lang) => import(`@talk/l10n/${lang}.json`)),
			loadAndRegisterL10n('talk_desktop', language, (lang) => import(`../../l10n/${lang}.json`)),
		])
	}

	document.body.dir = isRTL(canonicalLanguage) ? 'rtl' : 'ltr'
}

/**
 * Apply user data to the document attributes and global variables that can be then used by @nextcloud/auth
 *
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
 * Apply Talk Desktop specific Axios interceptors globally to use authentication for API and handle some responses on app level.
 *
 * @return {void}
 */
export function applyAxiosInterceptors() {
	// Handle 401 Unauthorized and 426 Upgrade Required responses
	let upgradeInterceptorHasBeenTriggeredOnce = false
	axios.interceptors.response.use((response) => response, (error) => {
		if (error?.response?.status === 401) {
			window.TALK_DESKTOP.logout()
		}
		if (error?.response?.status === 426) {
			if (!upgradeInterceptorHasBeenTriggeredOnce) {
				upgradeInterceptorHasBeenTriggeredOnce = true
				window.TALK_DESKTOP.showUpgrade()
			}
		}
		return Promise.reject(error)
	})
}

/**
 * Generates Initial State-like object based on capabilities and user metadata
 *
 * @param {object} capabilities - Capabilities
 * @param {object} userMetadata - User Metadata
 * @return {object}
 */
function getInitialStateFromCapabilities(capabilities, userMetadata) {
	return {
		// Todo check all used loadState for spreed
		spreed: {
			call_enabled: capabilities?.spreed?.config?.call?.enabled,
			signaling_mode: 'external', // TODO: Missed in Capabilities. Is it a problem?
			sip_dialin_info: undefined, // TODO: Missed in Capabilities. Is it a problem?
			grid_videos_limit: 19, // TODO: Missed in Capabilities. Is it a problem?
			grid_videos_limit_enforced: false, // TODO: Missed in Capabilities. Is it a problem?
			federation_enabled: capabilities?.spreed?.config?.federation?.enabled,
			start_conversations: capabilities?.spreed?.config?.conversations?.['can-create'],
			circles_enabled: capabilities?.circles !== undefined,
			guests_accounts_enabled: true, // TODO: Missed in Capabilities. It is a problem
			read_status_privacy: capabilities?.spreed?.config?.chat?.['read-privacy'],
			typing_privacy: capabilities?.spreed?.config?.chat?.['typing-privacy'],
			play_sounds: true, // Consider playing sound enabled by default on desktop until we have settings
			attachment_folder: capabilities?.spreed?.config?.attachments?.folder,
			attachment_folder_free_space: userMetadata?.quota?.free ?? 0, // TODO: Is User's Quota free equal to attachment_folder_free_space
			enable_matterbridge: false, // TODO: Missed in Capabilities. Is it a problem?
			user_group_ids: userMetadata?.groups,
		},
		theming: {
			background: capabilities?.theming?.background,
			themingDefaultBackground: '',
			data: {
				name: capabilities?.theming?.name,
				url: capabilities?.theming?.url,
				slogan: capabilities?.theming?.slogan,
				color: capabilities?.theming?.color,
				defaultColor: '#00679E', // TODO: Find in Capabilities
				imprintUrl: '', // TODO: Find in Capabilities
				privacyUrl: '', // TODO: Find in Capabilities
				inverted: false, // TODO: Find in Capabilities
				cacheBuster: undefined, // TODO: Find in Capabilities
				enabledThemes: ['light'], // TODO: Find in Capabilities
			},
			shortcutsDisabled: false, // TODO: Find in Capabilities
		},
		core: {
			capabilities,
			config: {
				version: appData.version.nextcloud?.string ?? '25.0.2.3',
				versionstring: appData.version.nextcloud?.string ?? '25.0.2',
				modRewriteWorking: false, // Forced to false. Is it used?
			},
		},
		notifications: {
			throttled_push_notifications: false, // TODO
			sound_talk: true, // TODO
			sound_notification: true, // TODO
		},
	}
}

/**
 * Apply initial state to the document by rendering <input type="hidden"> elements with initial state data.
 * Used by @nextcloud/initial-state package.
 */
function applyInitialState() {
	const initialState = getInitialStateFromCapabilities(appData.capabilities, appData.userMetadata)
	setupInitialState(initialState)
}

/**
 * Set CSS variable for --header-height
 */
function applyHeaderHeight() {
	document.body.style.setProperty('--header-height', `${TITLE_BAR_HEIGHT}px`, 'important')
	document.documentElement.style.setProperty('--header-height', `${TITLE_BAR_HEIGHT}px`, 'important')
}

/**
 * Handle download links
 */
function applyDownloadLinkHandler() {
	document.addEventListener('click', (event) => {
		const link = event.target.closest('a')
		if (link && link.hasAttribute('download')) {
			event.preventDefault()
			window.TALK_DESKTOP.downloadURL(link.href, link.download)
		}
	})
}

/**
 * Make all required initial setup for the web page for authorized user: server-rendered data, globals and ect.
 */
export async function setupWebPage() {
	appData.fromJSON(await window.TALK_DESKTOP.getAppData())
	await initAppConfig()
	await applyL10n()
	applyInitialState()
	initGlobals()
	applyUserData()
	applyHeaderHeight()
	applyAxiosInterceptors()
	applyDownloadLinkHandler()

	// Re-fetch appData if dirty
	if (appData.talkHashDirty) {
		try {
			await refetchAppData(appData)
		} catch {
			// This should never happen
			// If it does, let's try to relaunch the app
			window.TALK_DESKTOP.relaunch()
		}
		// Re-apply initial state after re-fetch
		applyInitialState()
	}

	window.systemInfo = await window.TALK_DESKTOP.getSystemInfo()

	// Notify that the webpage setup is finished
	document.dispatchEvent(new CustomEvent('TalkWebPageSetupDone'))
}
