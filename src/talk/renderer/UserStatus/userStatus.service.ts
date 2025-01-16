/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import axios from '@nextcloud/axios'
import { generateOcsUrl } from '@nextcloud/router'

/**
 * Fetches all predefined statuses from the server
 *
 * @return {Promise<import('./userStatus.types.ts').PredefinedUserStatus[]>}
 */
export async function fetchAllPredefinedStatuses() {
	const response = await axios.get(generateOcsUrl('apps/user_status/api/v1/predefined_statuses?format=json'))
	return response.data.ocs.data
}

/**
 * Fetches the current user status
 *
 * @return {Promise<import('./userStatus.types.ts').UserStatusPrivate>}
 */
export async function fetchCurrentUserStatus() {
	const response = await axios.get(generateOcsUrl('apps/user_status/api/v1/user_status'))
	return response.data.ocs.data
}

/**
 * Fetches the current user-status
 *
 * @param {string} userId - User id
 * @return {Promise<import('./userStatus.types.ts').UserStatus>}
 */
export async function fetchBackupStatus(userId) {
	const response = await axios.get(generateOcsUrl('apps/user_status/api/v1/statuses/{userId}', { userId: '_' + userId }))
	return response.data.ocs.data
}

/**
 * Sets the status
 *
 * @param {import('./userStatus.types.ts').UserStatusStatusType} statusType The status
 * @return {Promise<void>}
 */
export async function putUserStatusStatus(statusType) {
	await axios.put(generateOcsUrl('apps/user_status/api/v1/user_status/status'), { statusType })
}

/**
 * Sets a message based on our predefined statuses
 *
 * @param {string} messageId The id of the message, taken from predefined status service
 * @param {number | null} clearAt When to automatically clean the status
 * @return {Promise<void>}
 */
export async function putUserStatusPredefinedMessage(messageId, clearAt = null) {
	await axios.put(generateOcsUrl('apps/user_status/api/v1/user_status/message/predefined?format=json'), {
		messageId,
		clearAt,
	})
}

/**
 * Sets a custom message
 *
 * @param {string} message The user-defined message
 * @param {string | null} statusIcon The user-defined icon
 * @param {number | null} clearAt When to automatically clean the status
 * @return {Promise<void>}
 */
export async function putUserStatusCustomMessage(message, statusIcon = null, clearAt = null) {
	await axios.put(generateOcsUrl('apps/user_status/api/v1/user_status/message/custom?format=json'), {
		message,
		statusIcon,
		clearAt,
	})
}

/**
 * Clears the current status of the user
 *
 * @return {Promise<void>}
 */
export async function deleteUserStatusMessage() {
	await axios.delete(generateOcsUrl('apps/user_status/api/v1/user_status/message?format=json'))
}

/**
 * Updates the user status, including the online status, the custom message and removing the custom message
 *
 * @param {import('./userStatus.types.ts').UserStatus} oldUserStatus - The current user status
 * @param {import('./userStatus.types.ts').UserStatus} newUserStatus - The new user status
 * @return {Promise<void>}
 */
export async function updateUserStatus(oldUserStatus, newUserStatus) {
	const hasStatusChanged = newUserStatus.status !== oldUserStatus.status
	const hasPredefinedMessageChanged = newUserStatus.messageIsPredefined && newUserStatus.messageId !== oldUserStatus.messageId
	const hasCustomMessageChanged = newUserStatus.message !== oldUserStatus.message || newUserStatus.icon !== oldUserStatus.icon || newUserStatus.clearAt !== oldUserStatus.clearAt
	const hasCustomMessageCleared = !newUserStatus.message && !newUserStatus.icon

	const requests = []

	if (hasStatusChanged) {
		requests.push(putUserStatusStatus(newUserStatus.status))
	}

	if (hasPredefinedMessageChanged) {
		requests.push(putUserStatusPredefinedMessage(newUserStatus.messageId, newUserStatus.clearAt))
	} else if (hasCustomMessageChanged) {
		if (hasCustomMessageCleared) {
			requests.push(deleteUserStatusMessage())
		} else {
			requests.push(putUserStatusCustomMessage(newUserStatus.message, newUserStatus.icon, newUserStatus.clearAt))
		}
	}

	await Promise.all(requests)
}

/**
 * Revert the automated status
 *
 * @param {string} messageId - The id of the message that should be reverted
 * @return {Promise<import('./userStatus.types.ts').UserStatus>}
 */
export async function revertToBackupStatus(messageId) {
	const response = await axios.delete(generateOcsUrl('apps/user_status/api/v1/user_status/revert/{messageId}', { messageId }))
	return response.data.ocs.data
}

/**
 * Send a heartbeat and returns the current user status
 *
 * @param {boolean} isAway - Whether the user is away
 * @return {Promise<import('./userStatus.types.ts').UserStatus|null>}
 */
export async function heartbeatUserStatus(isAway) {
	const response = await axios.put(generateOcsUrl('apps/user_status/api/v1/heartbeat?format=json'), {
		status: isAway ? 'away' : 'online',
	})
	// If 204 No content - return null
	return response.data ? response.data.ocs.data : null
}
