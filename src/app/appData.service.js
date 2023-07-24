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

import { getCurrentUserData, getCapabilities } from '../shared/ocs.service.js'
import packageJson from '../../package.json'

/**
 * Re-fetch capabilities and userMetadata and update appData
 *
 * @param {import('./AppData.js').appData} appData appData
 * @param {boolean} [persist=false] Persist after re-fetch
 * @return {Promise<void>}
 * @throws {Error}
 */
export async function refetchAppData(appData, persist = false) {
	const [userMetadata, capabilitiesResponse] = await Promise.all([
		getCurrentUserData(),
		getCapabilities(),
	])
	const talkCapabilities = capabilitiesResponse.capabilities.spreed
	appData.talkHash = null
	appData.talkHashDirty = false
	appData.userMetadata = userMetadata
	appData.capabilities = capabilitiesResponse.capabilities
	appData.version.nextcloud = capabilitiesResponse.version
	appData.version.talk = talkCapabilities.version
	appData.version.desktop = packageJson.version
	if (persist) {
		appData.persist()
	}
}

/**
 * If talk hash is dirty, re-fetch capabilities and userMetadata and update appData
 *
 * @param {import('./AppData.js').appData} appData appData
 * @return {Promise<void>}
 * @throws {Error}
 */
export async function refetchAppDataIfDirty(appData) {
	// Re-fetch on dirty Talk hash and any desktop client upgrade
	if (!appData.talkHashDirty && packageJson.version === appData.version.desktop) {
		return
	}

	await new Promise((resolve) => {
		/**
		 * Try to re-fetch appData
		 *
		 * @return {Promise<boolean>} true if re-fetch finished and should not be retried
		 */
		async function doRefetch() {
			try {
				await refetchAppData(appData, true)
				console.debug('AppData re-fetched')
				return true
			} catch (error) {
				// In development mode unauthenticated response will be ERR_NETWORK due to CORS error
				if (error.response?.status === 401 || process.env.NODE_ENV === 'development') {
					appData.reset().persist()
					console.debug('AppData credentials are invalid... Resetting')
					return true
				}
				// Network error, maintenance, service unavailable etc.
				// Let's try again later
				console.debug(`Cannot get AppData... Error: ${error.code}. Response status: ${error.response?.status || 'unknown'}`)
				return false
			}
		}

		/**
		 * Recursively re-try a re-fetch attempt with a timeout
		 *
		 * @param {number} [delay=1000] delay in milliseconds
		 */
		function retryRefetch(delay = 1_000) {
			const MAX_DELAY = 2 ** 7 * 1000 // 128_000 = ~2 minutes

			console.debug(`Retry in ${delay} ms...`)
			setTimeout(async () => {
				if (await doRefetch()) {
					return resolve()
				}
				retryRefetch(delay < MAX_DELAY ? delay * 2 : delay)
			}, delay)
		}

		doRefetch()
			.then((success) => {
				if (success) {
					return resolve()
				}
				retryRefetch()
			})
	})
}
