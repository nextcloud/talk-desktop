/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// TODO: use safeStorage for credentials

/**
 * @typedef {object} NextcloudVersion
 * @property {string} edition - edition
 * @property {boolean} extendedSupport - has extended support
 * @property {number} major - major version
 * @property {number} minor - minor version
 * @property {number} micro - patch version
 * @property {string} string - version string, e.g. "31.0.1 rc-1"
 */

export class AppData {
	serverUrl = null
	userMetadata = null
	/**
	 * @type {any|null}
	 */
	capabilities = null
	version = {
		/**
		 * @type {NextcloudVersion|null}
		 */
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
			serverUrl: this.serverUrl,
			userMetadata: this.userMetadata,
			capabilities: this.capabilities,
			version: this.version,
			credentials: this.credentials,
			talkHash: this.talkHash,
			talkHashDirty: this.talkHashDirty,
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
	 * Set TalkHash and mark it as dirty if changed
	 *
	 * @param {string} hash new hash
	 * @return {AppData} this
	 */
	setTalkHash(hash) {
		if (this.talkHash && this.talkHash !== hash) {
			this.talkHashDirty = true
			this.talkHash = hash
		}
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
