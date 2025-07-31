/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { createSharedComposable } from '@vueuse/core'
import { onBeforeUnmount, watch } from 'vue'
import { useIsAway } from './composables/useIsAway.ts'
import { useUserStatusStore } from './userStatus.store.ts'

// General notes:
// - Server has INVALIDATE_STATUS_THRESHOLD with 15 minutes, preventing immediate status update on heartbeat request
//   See: https://github.com/nextcloud/server/blob/v31.0.5/apps/user_status/lib/Service/StatusService.php
// - However, "online" status has higher priority than "away"
// - Thus:
//   - Changing "Away -> Online" is immediate
//   - Changing "Online -> Away" has a 15 minutes threshold
// - See: https://github.com/nextcloud/server/blob/v31.0.5/apps/user_status/lib/Service/StatusService.php#L41-L48
//   and: https://github.com/nextcloud/server/blob/master/apps/user_status/lib/Listener/UserLiveStatusListener.php#L75-L87
// - This might change in future to have symmetric behavior on heartbeat

/** How often to send the heartbeat. Must be less than 15 min. */
const HEARTBEAT_INTERVAL = 5 * 60 * 1000 // 5 minutes

/** How long user is considered active before going away */
const AWAY_THRESHOLD = 2 * 60 * 1000 // 2 minutes

/**
 * Background heartbeat with user status update
 */
export const useHeartbeat = createSharedComposable(() => {
	const userStatusStore = useUserStatusStore()
	const isAway = useIsAway(AWAY_THRESHOLD)

	let heartbeatTimeout: number | undefined

	/**
	 * Send a heartbeat
	 */
	async function sendHeartbeat() {
		try {
			await userStatusStore.updateUserStatusWithHeartbeat(isAway.value)
		} catch (error) {
			console.error('Error on heartbeat:', error)
		}
	}

	/**
	 * (Re)start heartbeat interval
	 */
	async function restartHeartbeat() {
		if (heartbeatTimeout) {
			clearTimeout(heartbeatTimeout)
		}
		await sendHeartbeat()
		// TODO: fix when main and renderer process have separate tsconfig
		heartbeatTimeout = setTimeout(restartHeartbeat, HEARTBEAT_INTERVAL) as unknown as number
	}

	// Restart heartbeat to immediately notify server on state change
	watch(isAway, () => {
		// Note: both app and system level activity state changes to inactive with a threshold.
		// Only lock/unlock state can be changed many times in a short period, but it is unlikely
		// Thus it unlikely overloads with heartbeat, no need to debounce
		restartHeartbeat()
	}, { immediate: true })

	onBeforeUnmount(() => {
		clearTimeout(heartbeatTimeout)
	})
})
