/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { createApp } from 'vue'
import { setupWebPage } from '../../shared/setupWebPage.js'

import '../../shared/assets/styles.css'

await setupWebPage()

const { default: AuthenticationApp } = await import('./AuthenticationApp.vue')

createApp(AuthenticationApp).mount('#app')
