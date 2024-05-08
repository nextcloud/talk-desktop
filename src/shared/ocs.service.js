/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * @module
 * Stateful service
 */

import axios from '@nextcloud/axios'
import { generateOcsUrl } from '@nextcloud/router'

/**
 * @see https://docs.nextcloud.com/server/latest/developer_manual/client_apis/OCS/ocs-api-overview.html#capabilities-api
 * @return {Promise<import('axios').AxiosResponse>}
 */
export async function getCapabilities() {
	const response = await axios.get(generateOcsUrl('cloud/capabilities'))
	return response.data.ocs.data
}

/**
 * Request user metadata
 *
 * @see https://docs.nextcloud.com/server/latest/developer_manual/client_apis/OCS/ocs-api-overview.html#user-metadata
 * @param {string} userId - userid
 * @return {Promise<import('axios').AxiosResponse>}
 */
export async function getUserMetadata({ userId }) {
	const response = await axios.get(generateOcsUrl('cloud/users/{userId}', { userId }))
	return response.data.ocs.data
}

/**
 * Request current user
 *
 * @see TODO: ADD LINKS
 * @return {Promise<*>}
 *
 */
export async function getCurrentUserData() {
	const response = await axios.get(generateOcsUrl('cloud/user'))
	return response.data.ocs.data
}
