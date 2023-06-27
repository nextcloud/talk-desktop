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
import { version } from '../../package.json'

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
	appData.version.desktop = version
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
	if (appData.talkHashDirty || version !== appData.version.desktop) {
		return await refetchAppData(appData, true)
	}
}
