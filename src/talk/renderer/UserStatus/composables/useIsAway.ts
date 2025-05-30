/*
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { createSharedComposable } from '@vueuse/core'
import { computed } from 'vue'
import { useAppIdle } from './useAppIdle.ts'
import { useIdleDetector } from './useIdleDetector.ts'

/**
 * Whether the user is away or active
 *
 * @param threshold - How long user is considered active
 */
export const useIsAway = createSharedComposable((threshold = 60_000) => {
	const { userState, screenState } = useIdleDetector(threshold)
	const isAppIdle = useAppIdle(threshold)

	return computed(() => {
		return screenState.value === 'locked' // System Locked - the user is away immediately
			|| (userState.value !== 'active' && isAppIdle.value) // Check both to cover unavailable IdleDetector
	})
})
