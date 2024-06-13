/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// We need to use a copy of default styles here because we do not have real server styles before login on the server
import '../../shared/assets/default/default.css'
import '../../shared/assets/default/server.css'

import { createApp } from 'vue'
import AuthenticationApp from './AuthenticationApp.vue'
import { setupWebPage } from '../../shared/setupWebPage.js'

await setupWebPage()

createApp(AuthenticationApp).mount('#app')
