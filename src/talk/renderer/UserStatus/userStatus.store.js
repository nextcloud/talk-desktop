/*
 * @copyright Copyright (c) 2024 Grigorii Shartsev <me@shgk.me>
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
	const userStatus = ref(restoreUserStatus())

	/** @type {import('vue').Ref<import('./userStatus.types.ts').PredefinedUserStatus[]|null>} */
	const predefinedStatuses = ref(restorePredefinedStatuses())

	/** @type {import('vue').Ref<null|object>} */
	const backupStatus = ref(null)

	watch(userStatus, (newUserStatus) => cacheUserStatus(newUserStatus), { deep: true })

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
