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

import { loadState } from '@nextcloud/initial-state'
import { appData } from '../app/AppData.js'

export const OC = {
	// Constant from: https://github.com/nextcloud/server/blob/master/core/src/OC/constants.js
	coreApps: ['', 'admin', 'log', 'core/search', 'core', '3rdparty'],

	// For sounds loading
	appswebroots: {
		spreed: '/apps/spreed',
	},

	// TODO: Add OC.MimeType
	MimeType: {
		getIconUrl() {
			return undefined
		},
	},

	isUserAdmin() {
		return appData.userMetadata?.groups?.includes('admin')
	},

	get webroot() {
		// Original method returns only path, for example, /nextcloud-webroot
		// Desktop needs to have full URL: https://nextcloud.host/nextcloud-webroot
		return appData.serverUrl
	},

	config: {
		// TODO: It works in any case, but may make links with redundant index.php. Should get actual value of modRewriteWorking?
		modRewriteWorking: false,
	},

	dialogs: {
		confirm(text, title, callback) {
			callback(confirm(text))
		},
		confirmDestructive(text, title, options, callback) {
			callback(confirm(text))
		},
		filepicker() {
			alert('Unfortunately, Share from Nextcloud is not supported by Nextcloud Talk Preview')
		},
	},

	theme: {
		get productName() {
			return loadState('theming', 'data').name
		},
	},

	getHost() {
		return new URL(appData.serverUrl).host
	},

	getHostname() {
		return new URL(appData.serverUrl).hostname
	},

	getProtocol() {
		return new URL(appData.serverUrl).protocol
	},

	getPort() {
		return new URL(appData.serverUrl).port
	},
}

export const OCA = {}

export const OCP = {
	Accessibility: {
		disableKeyboardShortcuts: () => {},
	},
}
