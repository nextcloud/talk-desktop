/*
 * @copyright Copyright (c) 2022 Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
 *
 * @author Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
 *
 * @license GNU AGPL version 3 or any later version
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

import { appData } from '../app/AppData.js'

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
	}
}

export function loadState(app, key, fallback) {
	const capabilities = getInitialStateFromCapabilities(appData.capabilities, appData.userMetadata)
	const elem = capabilities[app][key]
	if (elem === null) {
		if (fallback !== undefined) {
			return fallback
		}
		throw new Error('Could not find initial state '.concat(key, ' of ').concat(app))
	}

	return elem
}
