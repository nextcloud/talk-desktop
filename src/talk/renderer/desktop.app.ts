/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Vue from 'vue'
import { createPinia, PiniaVuePlugin } from 'pinia'

/**
 * Create and mount the Talk Desktop
 */
export async function createTalkDesktopApp() {
	Vue.use(PiniaVuePlugin)
	const pinia = createPinia()

	// Load Talk Desktop asynchronously to make sure,
	// no module is loaded before the page has been set up and ready to run apps
	const { default: TalkDesktop } = await import('./TalkDesktop.vue')

	const TalkDesktopApp = Vue.extend(TalkDesktop)
	return new TalkDesktopApp({ pinia }).$mount('#app')
}
