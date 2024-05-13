/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { appData } from '../../app/AppData.js'

/**
 * Generates Initial State-like object based on capablilities and user metadata
 *
 * @param {object} capabilities - Capabilities
 * @param {object} userMetadata - User Metadata
 * @return {{core: {capabilities, config: {version: string, versionstring: string, modRewriteWorking: boolean}}, spreed: {federation_enabled: boolean, signaling_mode: string, read_status_privacy: *, play_sounds: boolean, sip_dialin_info: undefined, circles_enabled: boolean, grid_videos_limit_enforced: boolean, grid_videos_limit: number, attachment_folder: ((function(*): (this))|(function(*): (this))|*), call_enabled: *, attachment_folder_free_space: (number|number), enable_matterbridge: boolean, start_conversations: *, guests_accounts_enabled: boolean}, theming: {data: {privacyUrl: string, cacheBuster: undefined, defaultColor: string, color: *, name: *, imprintUrl: string, enabledThemes: string[], inverted: boolean, slogan: *, url: *}, background: *, shortcutsDisabled: boolean, themingDefaultBackground: string}}}
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
			federation_enabled: false, // TODO: Missed in Capabilities. Is it a problem?
			start_conversations: capabilities?.spreed?.config?.conversations?.['can-create'],
			circles_enabled: false, // TODO: Missed in Capabilities. Is it a problem?
			guests_accounts_enabled: true, // TODO: Missed in Capabilities. It is a problem
			read_status_privacy: capabilities?.spreed?.config?.chat?.['read-privacy'],
			play_sounds: true, // TODO: Missed in Capabilities. Is it a problem?
			attachment_folder: capabilities?.spreed?.config?.attachments?.folder,
			attachment_folder_free_space: userMetadata?.quota?.free ?? 0, // TODO: Is User's Quota free equal to attachment_folder_free_space
			enable_matterbridge: false, // TODO: Missed in Capabilities. Is it a problem?
			user_group_ids: userMetadata.groups,
		},
		theming: {
			background: capabilities?.theming?.background,
			themingDefaultBackground: '',
			data: {
				name: capabilities?.theming?.name,
				url: capabilities?.theming?.url,
				slogan: capabilities?.theming?.slogan,
				color: capabilities?.theming?.color,
				defaultColor: '#0082C9', // TODO: Find in Capabilities
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
				version: '25.0.2.3', // TODO: Find in Capabilities
				versionstring: '25.0.2', // TODO: Find in Capabilities
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

// eslint-disable-next-line jsdoc/require-jsdoc
export function loadState(app, key, fallback) {
	const capabilities = getInitialStateFromCapabilities(appData.capabilities, appData.userMetadata)
	const elem = capabilities[app]?.[key]
	if (elem === null || elem === undefined) {
		if (fallback !== undefined) {
			return fallback
		}
		throw new Error('Could not find initial state '.concat(key, ' of ').concat(app))
	}

	return elem
}
