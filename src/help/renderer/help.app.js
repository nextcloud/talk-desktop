/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import '../../shared/assets/default/default.css'
import '../../shared/assets/default/server.css'

import { createApp } from 'vue'
import HelpApp from './HelpApp.vue'
import { setupWebPage } from '../../shared/setupWebPage.js'

await setupWebPage()

createApp(HelpApp).mount('#app')
