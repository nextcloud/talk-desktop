/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { createApp } from 'vue'
import { setupWebPage } from '../../shared/setupWebPage.js'

import '../../shared/assets/styles.css'

await setupWebPage()

const { default: CallboxApp } = await import('./CallboxApp.vue')

createApp(CallboxApp).mount('#app')
