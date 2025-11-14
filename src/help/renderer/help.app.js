/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { createApp } from 'vue'
import { setupWebPage } from '../../shared/setupWebPage.js'

import '../../shared/assets/styles.css'
import './help.styles.css'

await setupWebPage()

const { default: HelpApp } = await import('./HelpApp.vue')

createApp(HelpApp).mount('#app')
