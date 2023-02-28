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

import { loadState } from './nextcloud-initial-state.js'
import { getCredentials } from '../accounts/credentials.service.js'
import { getUserMetadata } from '../shared/globalsStore.service.js'

export const OC = {
	// TODO: Add OC.MimeType
	MimeType: {
		getIconUrl() {
			return undefined;
		},
	},

	isUserAdmin() {
		return getUserMetadata()?.groups?.includes('admin')
	},

	// For router
	get webroot() {
		// Original method returns only path, for example, /nextcloud-webroot
		// Desktop needs to have full URL: https://nextcloud.host/nextcloud-webroot
		return getCredentials().server
	},

	config: {
		modRewriteWorking: false,
	},

	dialogs: {
		confirm(text, title, callback) {
			callback(confirm(text))
		},
		confirmDestructive(text, title, options, callback) {
			callback(confirm(text))
		},
	},

	theme: {
		get productName() {
			return loadState('theming', 'data').name
		},
	},

	getHost() {
		const [protocol, host] = getCredentials().server.split('://')
		return host.split(':')[0]
	},

	getHostname() {
		const [protocol, host] = getCredentials().server.split('://')
		return host
	},

	getProtocol() {
		const [protocol, host] = getCredentials().server.split('://')
		return protocol
	},
}

export const OCA = {}

export const OCP = {
	Accessibility: {
		disableKeyboardShortcuts: () => {},
	},
}
