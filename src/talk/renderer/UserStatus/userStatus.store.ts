/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import type {
	UserStatusPrivate,
	UserStatusPublic,
} from './userStatus.types.ts'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { emit, subscribe } from '@nextcloud/event-bus'
import { getCurrentUser } from '@nextcloud/auth'
import {
	fetchCurrentUserStatus,
	revertToBackupStatus,
	heartbeatUserStatus,
	updateUserStatus,
} from './userStatus.service.ts'

declare module '@nextcloud/event-bus' {
	interface NextcloudEvents {
		'user_status:status.updated': UserStatusPublic
	}
}

/**
 * Cache the user status in local storage
 *
 * @param userStatus - User status
 */
function cacheUserStatus(userStatus: UserStatusPrivate) {
	localStorage.setItem('TalkDesktop:userStatus', JSON.stringify(userStatus))
}

/**
 * Restore the user status from local storage
 */
function restoreUserStatus(): UserStatusPrivate | null {
	// @ts-expect-error - JSON parse type is invalid in lib.ts, `null` is a valid value to parse
	return JSON.parse(localStorage.getItem('TalkDesktop:userStatus'))
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
	const userStatus = ref<UserStatusPrivate | null>(null)

	const isDnd = computed(() => userStatus.value?.status === 'dnd')

	subscribe('user_status:status.updated', (newUserStatus) => {
		if (newUserStatus.userId === getCurrentUser()!.uid) {
			patchUserStatus(newUserStatus, false)
		}
	})

	// Restore the user status from cache
	const cachedStatus = restoreUserStatus()
	if (cachedStatus) {
		setUserStatus(cachedStatus, true)
	}

	watch(userStatus, (newUserStatus) => cacheUserStatus(newUserStatus!), { deep: true })

	const initPromise = (async () => {
		await updateUserStatusWithHeartbeat(false, true)
	})()

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
		Object.assign(userStatus.value!, newUserStatus)
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
	 * @param forceFetchStatus - Whether to force fetch the current status
	 */
	async function updateUserStatusWithHeartbeat(isAway: boolean, forceFetchStatus: boolean = false) {
		const status = await heartbeatUserStatus(isAway)

		if (status) {
			setUserStatus(status)
		} else if (forceFetchStatus) {
			// heartbeat returns the status only if it has changed
			// Request explicitly if forced to fetch status
			setUserStatus(await fetchCurrentUserStatus())
		}
	}

	return {
		initPromise,
		userStatus,
		isDnd,
		saveUserStatus,
		revertUserStatusFromBackup,
		updateUserStatusWithHeartbeat,
	}
})
