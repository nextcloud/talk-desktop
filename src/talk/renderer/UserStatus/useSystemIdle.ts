/*!
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { onUnmounted, readonly, ref } from 'vue'
import { requestUserGesturedPermission } from '../../../shared/requestUserGesturedPermission.ts'

let hasPermission = false

/**
 * Composable to detect user's system-level idle state using the IdleDetector API.
 *
 * @param threshold - How long user is considered idle in ms, default is 1 minute
 */
export function useSystemIdle(threshold: number = 60_000) {
	const isIdleDetected = ref(false)

	let abortController: AbortController
	let idleDetector: IdleDetector

	startIdleDetector()

	onUnmounted(() => {
		stopIdleDetector()
	})

	/**
	 * Start idle detection
	 */
	async function startIdleDetector() {
		if (!hasPermission) {
			const permission = await requestUserGesturedPermission(() => IdleDetector.requestPermission())
			if (permission !== 'granted') {
				console.warn('Idle detection permission denied.')
				return
			}
			hasPermission = true
			console.debug('IdleDetector permission granted.')
		}

		try {
			abortController = new AbortController()
			idleDetector = new IdleDetector()
			idleDetector.addEventListener('change', () => {
				isIdleDetected.value = idleDetector.userState === 'idle'
				console.debug(`Idle change: ${isIdleDetected.value}: ${new Date().toISOString()}.`)
			})
			await idleDetector.start({
				threshold,
				signal: abortController.signal,
			})
		} catch (error) {
			console.error('Error on starting IdleDetector:', error)
		}
	}

	/**
	 * Stop idle detection
	 */
	function stopIdleDetector() {
		isIdleDetected.value = false
		abortController?.abort()
		console.debug('IdleDetector stopped.')
	}

	return readonly(isIdleDetected)
}
