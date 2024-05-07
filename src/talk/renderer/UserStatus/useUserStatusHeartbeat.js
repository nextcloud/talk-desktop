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
