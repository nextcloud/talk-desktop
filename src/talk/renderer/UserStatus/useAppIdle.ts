/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { onBeforeUnmount, ref } from 'vue'

const WINDOW_ACTIVE_EVENTS = ['mousemove', 'mousedown', 'resize', 'keydown', 'touchstart', 'wheel'] as const

/**
 * Whether user is active in the app or away:
 * - The window is visible
 * - The user interacted with the app (mouse, keyboard, touch) in the last X minutes
 *
 * @param threshold - How long user is considered active after interaction in ms, default is 1 minute
 */
export function useAppIdle(threshold: number = 60_000) {
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
		isActiveTimeout = setTimeout(markInactive, threshold) as unknown as number
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
			window.removeEventListener(eventName, markActive, { capture: true })
		}
		document.removeEventListener('visibilitychange', handleVisibilityChange)
	})

	markActive()

	return isIdle
}
