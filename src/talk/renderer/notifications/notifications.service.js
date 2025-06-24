/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* eslint-disable jsdoc/require-param-type,jsdoc/require-param-description */

/**
 * @see https://github.com/nextcloud/notifications/blob/master/src/services/notificationsService.js
 * @todo this is mostly a copy. Should be reusing.
 */

import axios from '@nextcloud/axios'
import { getBuilder } from '@nextcloud/browser-storage'
import { generateOcsUrl } from '@nextcloud/router'

const BrowserStorage = getBuilder('notifications').clearOnLogout().persist().build()

/**
 * Remap snake_case to camelCase in the notification object
 *
 * @param {object} notification - Notification object
 * @return {*}
 */
function remapAttributes(notification) {
	notification.notificationId = notification.notification_id
	notification.objectId = notification.object_id
	notification.objectType = notification.object_type

	delete notification.notification_id
	delete notification.object_id
	delete notification.object_type

	return notification
}

/**
 * Request notifications and update storage, if necessary
 *
 * @param {string} lastETag - last known ETag
 * @return {Promise<void>}
 */
async function refreshData(lastETag) {
	let requestConfig = {}
	if (lastETag) {
		requestConfig = {
			headers: {
				'If-None-Match': lastETag,
			},
		}
	}

	try {
		const response = await axios.get(generateOcsUrl('apps/notifications/api/v2/notifications'), requestConfig)

		BrowserStorage.setItem('status', '' + response.status)
		if (response.status !== 204) {
			BrowserStorage.setItem('headers', JSON.stringify(response.headers))
			const data = response.data.ocs.data.map(remapAttributes)
			BrowserStorage.setItem('data', JSON.stringify(data))
			const notificationThresholdId = parseInt(BrowserStorage.getItem('notificationThresholdId') ?? 0, 10)
			if (data.length && data[0].notificationId > notificationThresholdId) {
				/**
				 * Notifications older than this ID will not create a native notification.
				 * see https://github.com/nextcloud/notifications/commit/6a543679b4de8af65cc82baa233ae17ffbbbc1af
				 */
				BrowserStorage.setItem('notificationThresholdId', data[0].notificationId)
			}
		}
	} catch (error) {
		if (error?.response?.status) {
			BrowserStorage.setItem('status', '' + error.response.status)
		} else {
			// Setting to 500 in case no request was made so it's retried on the next attempt
			BrowserStorage.setItem('status', '500')
		}
	}
}

/**
 * Get notifications from storage with refresh if necessary
 *
 * @param tabId
 * @param lastETag
 * @param forceRefresh
 * @param hasNotifyPush
 * @return {Promise<{tabId: string, headers: any, lastUpdated: number, data: any, status: number}>}
 */
export async function getNotificationsData(tabId, lastETag, forceRefresh, hasNotifyPush) {
	const lastUpdated = parseInt(BrowserStorage.getItem('lastUpdated'), 10)
	const lastTab = BrowserStorage.getItem('tabId')
	const now = Math.round(Date.now() / 1000)

	if (forceRefresh
		// Allow the same tab to refresh with less than the timeout,
		|| (lastTab === tabId && lastUpdated + 25 < now)
		// Allow the same tab to refresh with notify push,
		|| (lastTab === tabId && hasNotifyPush)
		// and at the same time give it some more time against other tabs.
		|| lastUpdated + 35 < now
	) {
		BrowserStorage.setItem('tabId', tabId)
		BrowserStorage.setItem('lastUpdated', now)
		console.debug('Refetching data in ' + tabId + ' (prev: ' + lastTab + ' age: ' + (now - lastUpdated) + ')')
		await refreshData(lastETag)
	} else {
		console.debug('Reusing data in ' + tabId + ' (prev: ' + lastTab + ' age: ' + (now - lastUpdated) + ')')
	}

	return {
		status: parseInt(BrowserStorage.getItem('status'), 10),
		headers: JSON.parse(BrowserStorage.getItem('headers') || '[]'),
		data: JSON.parse(BrowserStorage.getItem('data') || '[]'),
		tabId: BrowserStorage.getItem('tabId'),
		lastUpdated: parseInt(BrowserStorage.getItem('lastUpdated'), 10),
		notificationThresholdId: parseInt(BrowserStorage.getItem('notificationThresholdId') ?? 0, 10),
	}
}
