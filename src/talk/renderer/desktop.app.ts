/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Vue from 'vue'
import { createPinia, PiniaVuePlugin } from 'pinia'
import TitleBar from './TitleBar/TitleBar.vue'

/**
 * @return {import('vue').ComponentPublicInstance}
 */
export function createDesktopApp() {
	Vue.use(PiniaVuePlugin)

	const TitleBarApp = Vue.extend(TitleBar)

	return new TitleBarApp({ pinia: createPinia() }).$mount('#title-bar')
}
