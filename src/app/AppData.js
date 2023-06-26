/*
 * @copyright Copyright (c) 2022 Grigorii Shartsev <me@shgk.me>
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

	talkHash = null
	talkHashDirty = false

	credentials = null
	storageKey = 'AppData'

	/**
	 * Persist appData to LocalStorage
	 */
	persist() {
		localStorage.setItem(this.storageKey, JSON.stringify(this.toJSON()))
	}

	/**
	 * Restore appData from LocalStorage
	 *
	 * @return {AppData} this
	 */
	restore() {
		try {
			const parsed = JSON.parse(localStorage.getItem(this.storageKey))
			if (parsed) {
				this.fromJSON(parsed)
			}
		} catch (error) {
			// Most likely parsing JSON error
			console.error('Error on appData restore', error)
		}
		return this
	}

	/**
	 * Convert appData to plain object to serialize to JSON
	 *
	 * @return {object}
	 */
	toJSON() {
		return {
			serverUrl: appData.serverUrl,
			userMetadata: appData.userMetadata,
			capabilities: appData.capabilities,
			version: appData.version,
			credentials: appData.credentials,
			talkHash: appData.talkHash,
			talkHashDirty: appData.talkHashDirty,
		}
	}

	/**
	 * Set appData values from plain object
	 *
	 * @param {object} obj plain object
	 * @return {AppData} this
	 */
	fromJSON(obj) {
		this.serverUrl = obj.serverUrl
		this.userMetadata = obj.userMetadata
		this.capabilities = obj.capabilities
		this.version = obj.version
		this.credentials = obj.credentials
		this.talkHash = obj.talkHash
		this.talkHashDirty = obj.talkHashDirty
		return this
	}

	/**
	 * Set TalkHash and reset dirty flag
	 *
	 * @param {string} hash new hash
	 * @return {AppData} this
	 */
	setTalkHash(hash) {
		if (this.talkHash) {
			this.talkHashDirty = true
		}
		this.talkHash = hash
		return this
	}

	/**
	 * @param {boolean} isDirty is talk hash dirty
	 * @return {AppData} this
	 */
	setTalkHashDirty(isDirty) {
		this.talkHashDirty = isDirty
		return this
	}

	/**
	 * Reset appData
	 *
	 * @return {AppData} this
	 */
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
		return this
	}

}

/**
 * Global application's appData
 *
 * @type {AppData}
 */
export const appData = new AppData()
