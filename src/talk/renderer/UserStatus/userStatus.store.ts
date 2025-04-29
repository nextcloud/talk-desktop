/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import type { UserStatusPrivate, UserStatusPublic } from './userStatus.types.ts'

import { getCurrentUser } from '@nextcloud/auth'
import { emit, subscribe } from '@nextcloud/event-bus'
import { defineStore } from 'pinia'
import { computed } from 'vue'
import { browserStorage } from '../../../shared/browserStorage.service.ts'
import { useBrowserStorage } from '../../../shared/useBrowserStorage.ts'
import {
	fetchCurrentUserStatus,
	heartbeatUserStatus,
	revertToBackupStatus,
	updateUserStatus,
} from './userStatus.service.ts'

declare module '@nextcloud/event-bus' {
	interface NextcloudEvents {
		'user_status:status.updated': UserStatusPublic
	}
}

/**
 * Emit the user status update event
 *
 * @param userStatus - User status
 */
function emitUserStatusUpdated(userStatus: UserStatusPublic) {
	emit('user_status:status.updated', {
		status: userStatus.status,
		message: userStatus.message,
		icon: userStatus.icon,
		clearAt: userStatus.clearAt,
		userId: userStatus.userId,
	})
}

export const useUserStatusStore = defineStore('userStatus', () => {
	const userStatus = useBrowserStorage<UserStatusPrivate | null>(browserStorage, 'userStatus', null)

	const isDnd = computed(() => userStatus.value?.status === 'dnd')

	subscribe('user_status:status.updated', (newUserStatus) => {
		if (newUserStatus.userId === getCurrentUser()!.uid) {
			patchUserStatus(newUserStatus, false)
		}
	})

	refreshUserStatus()

	/**
	 * Fetch the current user status (Private)
	 */
	async function refreshUserStatus() {
		setUserStatus(await fetchCurrentUserStatus())
	}

	/**
	 * Set the user status
	 *
	 * @param newUserStatus - New user status
	 * @param withEmit - Whether to emit the update event
	 */
	function setUserStatus(newUserStatus: UserStatusPrivate, withEmit: boolean = true) {
		userStatus.value = newUserStatus
		if (withEmit) {
			emitUserStatusUpdated(userStatus.value)
		}
	}

	/**
	 * Patch the user status
	 *
	 * @param newUserStatus - New user status
	 * @param withEmit - Whether to emit the update event
	 */
	function patchUserStatus(newUserStatus: Partial<UserStatusPrivate>, withEmit: boolean = true) {
		userStatus.value = { ...userStatus.value, ...newUserStatus } as UserStatusPrivate
		if (withEmit) {
			emitUserStatusUpdated(userStatus.value!)
		}
	}

	/**
	 * Save the user status
	 *
	 * @param newUserStatus - New user status
	 */
	async function saveUserStatus(newUserStatus: UserStatusPrivate) {
		try {
			const newUserStatusDto = { ...newUserStatus }
			await updateUserStatus(userStatus.value!, newUserStatusDto)
			setUserStatus(newUserStatus)
			return true
		} catch {
			return false
		}
	}

	/**
	 * Revert the user status from the backup
	 */
	async function revertUserStatusFromBackup() {
		await revertToBackupStatus(userStatus.value!.messageId!)
		setUserStatus(await fetchCurrentUserStatus())
	}

	/**
	 * Update the user status with a heartbeat
	 *
	 * @param isAway - Whether the user is away
	 */
	async function updateUserStatusWithHeartbeat(isAway: boolean) {
		const status = await heartbeatUserStatus(isAway)
		if (status) {
			setUserStatus(status)
		}
	}

	return {
		userStatus,
		isDnd,
		refreshUserStatus,
		saveUserStatus,
		revertUserStatusFromBackup,
		updateUserStatusWithHeartbeat,
	}
})
