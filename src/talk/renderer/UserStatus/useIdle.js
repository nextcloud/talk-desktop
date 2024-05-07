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
