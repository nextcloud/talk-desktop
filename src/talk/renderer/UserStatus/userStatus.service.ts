/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {
	PredefinedUserStatus,
	UserStatusBackup,
	UserStatusPrivate,
	UserStatusStatusType,
} from './userStatus.types.ts'

import axios from '@nextcloud/axios'
import { generateOcsUrl } from '@nextcloud/router'

// TODO: add types to @nextcloud/types or @nextcloud/axios
type OcsResponse<T> = {
	meta: {
		status: string
		statuscode: number
		message: string
	}
	ocs: {
		data: T
	}
}

/**
 * Fetch all predefined statuses
 */
export async function fetchAllPredefinedStatuses() {
	const response = await axios.get<OcsResponse<PredefinedUserStatus[]>>(generateOcsUrl('apps/user_status/api/v1/predefined_statuses?format=json'))
	return response.data.ocs.data
}

/**
 * Fetch the current user status
 */
export async function fetchCurrentUserStatus() {
	const response = await axios.get<OcsResponse<UserStatusPrivate>>(generateOcsUrl('apps/user_status/api/v1/user_status'))
	return response.data.ocs.data
}

/**
 * Fetch the current user backup status
 *
 * @param userId - User id
 */
export async function fetchBackupStatus(userId: string) {
	const response = await axios.get<OcsResponse<UserStatusBackup>>(generateOcsUrl('apps/user_status/api/v1/statuses/{userId}', { userId: '_' + userId }))
	return response.data.ocs.data
}

/**
 * Set the user status's status
 *
 * @param statusType - Status
 */
export async function putUserStatusStatus(statusType: UserStatusStatusType) {
	await axios.put(generateOcsUrl('apps/user_status/api/v1/user_status/status'), { statusType })
}

/**
 * Set user status message based on predefined statuses
 *
 * @param messageId - ID of the message, taken from predefined status service
 * @param clearAt - When to automatically clean the status
 */
export async function putUserStatusPredefinedMessage(messageId: string, clearAt: number | null = null) {
	await axios.put(generateOcsUrl('apps/user_status/api/v1/user_status/message/predefined?format=json'), {
		messageId,
		clearAt,
	})
}

/**
 * Set custom user status message
 *
 * @param message - User-defined message
 * @param statusIcon - User-defined icon
 * @param clearAt - When to automatically clean the status
 */
export async function putUserStatusCustomMessage(message: string | null, statusIcon: string | null = null, clearAt: number | null = null) {
	await axios.put(generateOcsUrl('apps/user_status/api/v1/user_status/message/custom?format=json'), {
		message,
		statusIcon,
		clearAt,
	})
}

/**
 * Clear the current user status
 */
export async function deleteUserStatusMessage() {
	await axios.delete(generateOcsUrl('apps/user_status/api/v1/user_status/message?format=json'))
}

/**
 * Update the user status, including online status, a custom message, or removing a custom message
 *
 * @param oldUserStatus - Current user status
 * @param newUserStatus - New user status
 */
export async function updateUserStatus(oldUserStatus: UserStatusPrivate, newUserStatus: UserStatusPrivate) {
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
 * Revert the automated (backup) status
 *
 * @param messageId - ID of the message that should be reverted
 */
export async function revertToBackupStatus(messageId: string) {
	const response = await axios.delete<OcsResponse<UserStatusPrivate>>(generateOcsUrl('apps/user_status/api/v1/user_status/revert/{messageId}', { messageId }))
	return response.data.ocs.data
}

/**
 * Send a heartbeat and get the current user status again
 *
 * @param isAway - Whether the user is away
 */
export async function heartbeatUserStatus(isAway: boolean) {
	const response = await axios.put<OcsResponse<UserStatusPrivate> | null>(generateOcsUrl('apps/user_status/api/v1/heartbeat?format=json'), {
		status: isAway ? 'away' : 'online',
	})
	// If 204 No content - return null
	return response.data ? response.data.ocs.data : null
}
