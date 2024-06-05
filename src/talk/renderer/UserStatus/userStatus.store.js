/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { emit, subscribe } from '@nextcloud/event-bus'
import { getCurrentUser } from '@nextcloud/auth'
import {
	fetchAllPredefinedStatuses,
	fetchCurrentUserStatus,
	revertToBackupStatus,
	heartbeatUserStatus,
	updateUserStatus, fetchBackupStatus,
} from './userStatus.service.js'

const cacheUserStatus = (userStatus) => localStorage.setItem('TalkDesktop:userStatus', JSON.stringify(userStatus))
const restoreUserStatus = () => JSON.parse(localStorage.getItem('TalkDesktop:userStatus'))

const cachePredefinedStatuses = (userStatus) => localStorage.setItem('TalkDesktop:predefinedStatuses', JSON.stringify(userStatus))
const restorePredefinedStatuses = () => JSON.parse(localStorage.getItem('TalkDesktop:predefinedStatuses'))

export const useUserStatusStore = defineStore('userStatus', () => {
	/** @type {import('vue').Ref<import('./userStatus.types.ts').UserStatus|null>} */
	const userStatus = ref(null)

	/** @type {import('vue').Ref<import('./userStatus.types.ts').PredefinedUserStatus[]|null>} */
	const predefinedStatuses = ref(restorePredefinedStatuses())

	/** @type {import('vue').Ref<null|object>} */
	const backupStatus = ref(null)

	const emitUserStatusUpdated = () => emit('user_status:status.updated', {
		status: userStatus.value.status,
		message: userStatus.value.message,
		icon: userStatus.value.icon,
		clearAt: userStatus.value.clearAt,
		userId: userStatus.value.userId,
	})

	subscribe('user_status:status.updated', (newUserStatus) => {
		if (newUserStatus.userId === getCurrentUser().uid) {
			patchUserStatus(newUserStatus, false)
		}
	})

	const setUserStatus = (newUserStatus, withEmit = true) => {
		userStatus.value = newUserStatus
		backupStatus.value = null
		if (withEmit) {
			emitUserStatusUpdated()
		}
	}

	const patchUserStatus = (newUserStatus, withEmit = true) => {
		Object.assign(userStatus.value, newUserStatus)
		backupStatus.value = null
		if (withEmit) {
			emitUserStatusUpdated()
		}
	}

	const saveUserStatus = async (newUserStatus) => {
		try {
			const newUserStatusDto = { ...newUserStatus }
			await updateUserStatus(userStatus.value, newUserStatusDto)
			setUserStatus(newUserStatus)
			return true
		} catch {
			return false
		}
	}

	const revertUserStatusFromBackup = async () => {
		await revertToBackupStatus(userStatus.value.messageId)
		setUserStatus(await fetchCurrentUserStatus())
		backupStatus.value = null
	}

	const updateUserStatusWithHeartbeat = async (isAway, forceFetchStatus = false) => {
		const status = await heartbeatUserStatus(isAway)

		if (status) {
			setUserStatus(status)
			backupStatus.value = await fetchBackupStatus(getCurrentUser().uid).catch(() => null)
		} else if (forceFetchStatus) {
			// heartbeat returns the status only if it has changed
			// Request explicitly if forced to fetch status
			setUserStatus(await fetchCurrentUserStatus())
			backupStatus.value = await fetchBackupStatus(getCurrentUser().uid).catch(() => null)
		}
	}

	const cachedStatus = restoreUserStatus()
	if (cachedStatus) {
		setUserStatus(cachedStatus, true)
	}

	watch(userStatus, (newUserStatus) => cacheUserStatus(newUserStatus), { deep: true })

	const initPromise = (async () => {
		await updateUserStatusWithHeartbeat(false, true)

		predefinedStatuses.value = await fetchAllPredefinedStatuses()
		cachePredefinedStatuses(predefinedStatuses.value)
	})()

	return {
		initPromise,
		userStatus,
		predefinedStatuses,
		backupStatus,
		saveUserStatus,
		revertUserStatusFromBackup,
		updateUserStatusWithHeartbeat,
	}
})
