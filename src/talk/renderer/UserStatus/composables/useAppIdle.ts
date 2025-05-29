/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { createSharedComposable, useEventListener } from '@vueuse/core'
import { onBeforeUnmount, ref } from 'vue'

const WINDOW_ACTIVE_EVENTS: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'resize', 'keydown', 'touchstart', 'wheel']

/**
 * Whether user is idle in the app (away) - interacted with the app (mouse, keyboard, touch) in the last THRESHOLD minutes
 * or made document visible
 *
 * @param threshold - How long user is considered active after interaction in ms, default is 1 minute
 */
export const useAppIdle = createSharedComposable((threshold: number = 60_000) => {
	const isIdle = ref(false)

	let activityTimeout: number

	/**
	 * Set new isIdle value and start
	 *
	 * @param newIsIdle - New isIdle
	 */
	function setIsIdle(newIsIdle: boolean) {
		isIdle.value = newIsIdle
		clearTimeout(activityTimeout)
		if (!newIsIdle) {
			// TODO: separate tsconfig for main process (Node.js Environment) and renderer process (Browser Environment)
			activityTimeout = setTimeout(() => setIsIdle(true), threshold) as unknown as number
		}
	}

	useEventListener(WINDOW_ACTIVE_EVENTS, () => {
		setIsIdle(false)
	})

	useEventListener(document, 'visibilitychange', () => {
		setIsIdle(document.hidden)
	})

	setIsIdle(false)

	onBeforeUnmount(() => {
		clearTimeout(activityTimeout)
	})

	return isIdle
})
