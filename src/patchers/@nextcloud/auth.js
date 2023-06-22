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
