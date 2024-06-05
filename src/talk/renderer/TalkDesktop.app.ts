/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { createPinia } from 'pinia'
import { createApp } from 'vue'

/**
 * Create and mount the Talk Desktop
 */
export async function createTalkDesktopApp() {
	const pinia = createPinia()

	// Load Talk Desktop asynchronously to make sure,
	// no module is loaded before the page has been set up and ready to run apps
	const { default: TalkDesktop } = await import('./TalkDesktop.vue')

	createApp(TalkDesktop).use(pinia).mount('#app')
}
