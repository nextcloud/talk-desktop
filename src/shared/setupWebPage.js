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
import { BUILD_CONFIG } from './build.config.ts'
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
	/*
		// Converting web-page values to an object:
		[...document.getElementById('initial-state-container').children].map((input) => {
			const [, app, key] = input.id.slice('#initial-state'.length).match(/(.*?)-(.*)/)
			return { app, key, value: OCP.InitialState.loadState(app, key) }
		}).reduce((acc, { app, key, value }) => ((acc[app] ??= {})[key] = value, acc), {})
	*/

	// TODO: make sure all use initial state is covered and there is no MISSED values
	// TODO: when possible, migrate Initial State to capabilities
	return {
		spreed: {
			call_enabled: capabilities?.spreed?.config?.call?.enabled,
			signaling_mode: 'external', // MISSED
			sip_dialin_info: '', // MISSED
			grid_videos_limit: 19, // MISSED
			grid_videos_limit_enforced: false, // MISSED
			federation_enabled: capabilities?.spreed?.config?.federation?.enabled,
			// default_permissions - MISSED (!)
			start_conversations: capabilities?.spreed?.config?.conversations?.['can-create'],
			circles_enabled: capabilities?.circles !== undefined,
			guests_accounts_enabled: true, // MISSED
			read_status_privacy: capabilities?.spreed?.config?.chat?.['read-privacy'],
			typing_privacy: capabilities?.spreed?.config?.chat?.['typing-privacy'],
			play_sounds: true, // MISSED
			force_enable_blur_filter: 'yes', // Unused
			user_group_ids: userMetadata?.groups,
			attachment_folder: capabilities?.spreed?.config?.attachments?.folder,
			attachment_folder_free_space: userMetadata?.quota?.free ?? 0,
			enable_matterbridge: false, // MISSED
		},
		core: {
			// reference-provider-list - MISSED
			// reference-provider-timestamps - MISSED
			'active-app': 'spreed',
			// Originally for Web UI header menu, but used for getting localized app name in libraries
			apps: [{
				id: 'spreed',
				name: BUILD_CONFIG.applicationName,
				href: '/talk_desktop__window_talk/index.html',
				icon: new URL('../../img/talk-icon-plain-dark.svg', import.meta.url).href,
				order: -5,
				type: 'link',
				active: true,
				unread: 0,
				classes: '',
				app: 'spreed',
				default: true,
			}],
			settingsNavEntries: [], // Unused
			projects_enabled: false, // MISSED
			config: {
				// blacklist_files_regex - MISSED, used in @nextcloud/dialog via _oc_config, deprecated
				forbidden_filename_characters: capabilities?.files?.forbidden_filename_characters,
				auto_logout: false, // Unused
				loglevel: 0, // MISSED
				lost_password_link: null, // Unused
				modRewriteWorking: capabilities?.['mod-rewrite-working'],
				no_unsupported_browser_warning: true,
				// session_keepalive - MISSED, used in notifications and user_status heartbeat
				// session_lifetime - MISSED, used in session heartbeat
				// sharing.maxAutocompleteResults - Unused
				// sharing.minSearchStringLength - Unused
				version: appData.version.nextcloud?.string ?? '25.0.2.3',
				versionstring: appData.version.nextcloud?.string ?? '25.0.2',
				'enable_non-accessible_features': true, // Unused
			},
			capabilities,
			versionHash: '', // Unused
		},
		theming: {
			data: {
				name: capabilities?.theming?.name,
				slogan: capabilities?.theming?.slogan,
				url: capabilities?.theming?.url,
				imprintUrl: '', // Unused
				privacyUrl: BUILD_CONFIG.privacyUrl,
				primaryColor: BUILD_CONFIG.primaryColor,
				backgroundColor: BUILD_CONFIG.backgroundColor,
				defaultPrimaryColor: BUILD_CONFIG.primaryColor,
				defaultBackgroundColor: BUILD_CONFIG.backgroundColor,
				inverted: false, // Unused
				cacheBuster: undefined, // Unused
				enabledThemes: ['default'],
				color: BUILD_CONFIG.primaryColor,
			},
			shortcutsDisabled: false, // MISSED
		},
		notifications: {
			throttled_push_notifications: false, // MISSED
			sound_talk: true, // MISSED
			sound_notification: true, // MISSED
		},
		// user_status: {} - MISSED
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
	document.body.style.setProperty('--header-height', `${TITLE_BAR_HEIGHT}px`)
	document.documentElement.style.setProperty('--header-height', `${TITLE_BAR_HEIGHT}px`)
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
