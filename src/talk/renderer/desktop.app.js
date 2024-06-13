/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import DesktopHeader from './DesktopHeader.vue'

/**
 * @return {import('vue').ComponentPublicInstance}
 */
export function createDesktopApp() {
	return createApp(DesktopHeader).use(createPinia()).mount('#desktop-header')
}
