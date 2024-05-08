/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Vue from 'vue'
import { createPinia, PiniaVuePlugin } from 'pinia'
import DesktopHeader from './DesktopHeader.vue'

/**
 * @return {import('vue').ComponentPublicInstance}
 */
export function createDesktopApp() {
	Vue.use(PiniaVuePlugin)

	const DesktopHeaderApp = Vue.extend(DesktopHeader)

	return new DesktopHeaderApp({ pinia: createPinia() }).$mount('#desktop-header')
}
