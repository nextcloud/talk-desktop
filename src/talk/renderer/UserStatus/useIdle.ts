/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { onBeforeUnmount, ref } from 'vue'

const WINDOW_ACTIVE_EVENTS = ['mousemove', 'mousedown', 'resize', 'keydown', 'touchstart', 'wheel'] as const

/**
 * Hook to detect whether the user is active or away (idle)
 * @param options - Options
 * @param options.timeout - How long user is considered active, default is 1 minute
 */
export function useIdle({ timeout = 1000 * 60 }) {
	const isIdle = ref(false)

	let isActiveTimeout: number | undefined

	/**
	 * Mark user as inactive
	 */
	function markInactive() {
		isIdle.value = true
		clearTimeout(isActiveTimeout)
	}

	/**
	 * Mark user as active
	 */
	function markActive() {
		isIdle.value = false
		clearTimeout(isActiveTimeout)
		// TODO: separate tsconfig for main process (Node.js Environment) and renderer process (Browser Environment)
		isActiveTimeout = setTimeout(markInactive, timeout) as unknown as number
	}

	/**
	 * Handle visibility change
	 */
	function handleVisibilityChange() {
		if (document.hidden) {
			markInactive()
		} else {
			markActive()
		}
	}

	for (const eventName of WINDOW_ACTIVE_EVENTS) {
		window.addEventListener(eventName, markActive, { passive: true, capture: true })
	}
	document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true })

	onBeforeUnmount(() => {
		clearTimeout(isActiveTimeout)
		for (const eventName of WINDOW_ACTIVE_EVENTS) {
			window.removeEventListener(eventName, markActive)
		}
		document.removeEventListener('visibilitychange', handleVisibilityChange)
	})

	markActive()

	return {
		isIdle,
	}
}
