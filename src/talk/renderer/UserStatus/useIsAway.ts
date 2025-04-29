/*!
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { computed } from 'vue'
import { useAppIdle } from './useAppIdle.ts'
import { useSystemIdle } from './useSystemIdle.ts'
import { useIsLocked } from './useIsLocked.ts'

/**
 * Whether the user is away or online (active)
 *
 * @param threshold - How long user is considered active
 */
export function useIsAway(threshold: number) {
	const isAppIdle = useAppIdle(threshold)
	const isSystemIdle = useSystemIdle(threshold)
	const isLocked = useIsLocked()

	const isOnline = computed(() => {
		// System Locked - the user is away
		if (isLocked.value) {
			return false
		}

		// Active in the app - definitely online
		if (!isAppIdle.value) {
			return true
		}

		// Active in the system - online
		if (!isSystemIdle.value) {
			return true
		}

		// No sign of activity - away
		return false
	})

	const isAway = computed(() => !isOnline.value)

	return { isAway, isOnline }
}
