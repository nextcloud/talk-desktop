/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { computed, ref } from 'vue'

const launchAtStartup = ref(false)

window.TALK_DESKTOP.getLaunchAtStartup().then((value: boolean) => {
	launchAtStartup.value = value
})

/**
 * Get launch at startup setting synced with the system preference
 */
export function useLaunchAtStartup() {
	// Actualize the config in case it was changed in the OS after the initial app load
	window.TALK_DESKTOP.getLaunchAtStartup().then((value: boolean) => {
		launchAtStartup.value = value
	})

	return computed({
		get: () => launchAtStartup.value,
		set: (value: boolean) => {
			launchAtStartup.value = value
			void window.TALK_DESKTOP.setLaunchAtStartup(value)
		},
	})
}
