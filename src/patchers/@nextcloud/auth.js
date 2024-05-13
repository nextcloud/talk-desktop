/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { appData } from '../../app/AppData.js'

export {
	getRequestToken,
	onRequestTokenUpdate,
} from '@talk-modules--@nextcloud/auth'

/**
 *
 */
export function getCurrentUser() {
	return {
		uid: appData.userMetadata.id,
		// Current user metadata had different property name for display name than userMetadata
		// @see https://github.com/nextcloud/server/pull/36665
		displayName: appData.userMetadata.displayname ?? appData.userMetadata['display-name'],
		isAdmin: appData.userMetadata.groups.includes('admin'),
	}
}
