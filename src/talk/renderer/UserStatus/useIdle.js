/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { onBeforeUnmount, ref } from 'vue'

const WINDOW_ACTIVE_EVENTS = ['mousemove', 'mousedown', 'resize', 'keydown', 'touchstart', 'wheel']

/**
 * Hook to detect if the user is active or away (idle)
 *
 * @param {number} timeout - How long user is considered active, default is 1 minute
 * @return {{ isIdle: import('vue').Ref<boolean> }}
 */
export function useIdle({ timeout = 1000 * 60 }) {
	const isIdle = ref(false)

	let isActiveTimeout = null

	const markInactive = () => {
		isIdle.value = true
		clearTimeout(isActiveTimeout)
	}

	const markActive = () => {
		isIdle.value = false
		clearTimeout(isActiveTimeout)
		isActiveTimeout = setTimeout(markInactive, timeout)
	}

	const handleVisibilityChange = () => {
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
