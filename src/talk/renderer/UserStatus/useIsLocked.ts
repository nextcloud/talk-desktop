/*!
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { readonly, ref } from 'vue'

/**
 * Get the current lock state of the system.
 * Only available on Windows and macOS.
 * Always `false` on Linux.
 */
export function useIsLocked() {
	const isLocked = ref(false)

	window.TALK_DESKTOP.getIsLocked().then((value: boolean) => {
		console.debug('Initial isLocked value:', value)
		isLocked.value = value
	})

	window.TALK_DESKTOP.onIsLockedChange((newValue: boolean) => {
		console.debug('isLocked changed to:', newValue)
		isLocked.value = newValue
	})

	return readonly(isLocked)
}
