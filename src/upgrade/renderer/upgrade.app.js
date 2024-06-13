/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import '../../shared/assets/default/default.css'
import '../../shared/assets/default/server.css'

import { createApp } from 'vue'
import UpgradeApp from './UpgradeApp.vue'
import { setupWebPage } from '../../shared/setupWebPage.js'

await setupWebPage()

createApp(UpgradeApp).mount('#app')
