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

// TODO: use safeStorage for credentials

export class AppData {

	serverUrl = null
	userMetadata = null
	capabilities = null
	version = {
		nextcloud: null,
		talk: null,
		desktop: null,
	}

	credentials = null
	storageKey = 'AppData'

	persist() {
		localStorage.setItem(this.storageKey, JSON.stringify({
			serverUrl: this.serverUrl,
			userMetadata: this.userMetadata,
			capabilities: this.capabilities,
			version: this.version,
			credentials: this.credentials,
		}))
	}

	restore() {
		Object.assign(this, JSON.parse(localStorage.getItem(this.storageKey)))
	}

	reset() {
		Object.assign(this, {
			serverUrl: null,
			userMetadata: null,
			capabilities: null,
			version: {
				nextcloud: null,
				talk: null,
				desktop: null,
			},
			credentials: null,
		})
	}

}

export const appData = new AppData()
