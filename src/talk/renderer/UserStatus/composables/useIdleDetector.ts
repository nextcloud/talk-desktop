/*
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { createSharedComposable } from '@vueuse/core'
import { onBeforeMount, onBeforeUnmount, readonly, ref } from 'vue'
import { grantUserGesturedPermission } from '../../../../shared/grantUserGesturedPermission.ts'
import { once } from '../../../../shared/utils.ts'

/**
 * Grant IdleDetector permission
 */
const grantIdleDetectorPermission = once(async () => {
	const permission = await grantUserGesturedPermission(() => IdleDetector.requestPermission())
	if (permission !== 'granted') {
		throw new Error('Unexpected permission denied for IdleDetector')
	}
})

/**
 * Use IdleDetector API
 *
 * @param threshold - IdleDetector's threshold
 */
export const useIdleDetector = createSharedComposable((threshold: number = 60_000) => {
	const userState = ref<UserIdleState | undefined>(undefined)
	const screenState = ref<ScreenIdleState | undefined>(undefined)
	const abortController = new AbortController()

	onBeforeMount(async () => {
		try {
			await grantIdleDetectorPermission()

			const idleDetector = new IdleDetector()
			idleDetector.addEventListener('change', () => {
				userState.value = idleDetector.userState!
				screenState.value = idleDetector.screenState!
			})
			await idleDetector.start({
				threshold,
				signal: abortController.signal,
			})
		} catch (error) {
			console.error('Unexpected error on starting IdleDetector:', error)
		}
	})

	onBeforeUnmount(() => abortController.abort())

	return {
		screenState: readonly(screenState),
		userState: readonly(userState),
	}
})
