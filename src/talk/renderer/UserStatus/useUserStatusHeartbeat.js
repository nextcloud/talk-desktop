/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { onBeforeUnmount, watch } from 'vue'
import { useUserStatusStore } from './userStatus.store.js'
import { useIdle } from './useIdle.js'

/** How often to update the user status */
const USER_STATUS_UPDATE_INTERVAL = 5 * 60 * 1000 // 5 minutes

/** How long user is considered active */
const USER_STATUS_ACTIVE_TIMEOUT = 2 * 60 * 1000 // 2 minutes

/**
 * Hook to update the user status in the background
 *
 * @return {{ isIdle: import('vue').Ref<boolean> }}
 */
export function useUserStatusHeartbeat() {
	const userStatusStore = useUserStatusStore()
	const { isIdle } = useIdle({ timeout: USER_STATUS_ACTIVE_TIMEOUT })

	const heartbeat = () => userStatusStore.updateUserStatusWithHeartbeat(isIdle.value)

	let heartbeatInterval
	const restartHeartbeat = () => {
		if (heartbeatInterval) {
			clearInterval(heartbeatInterval)
		}
		heartbeat()
		heartbeatInterval = setInterval(heartbeat, USER_STATUS_UPDATE_INTERVAL)
	}

	watch(isIdle, () => {
		if (!isIdle.value) {
			restartHeartbeat()
		}
	}, { immediate: true })

	onBeforeUnmount(() => {
		clearInterval(heartbeatInterval)
	})

	return { isIdle }
}
