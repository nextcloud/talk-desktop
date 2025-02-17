/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import '../../shared/assets/global.styles.css'

import Vue from 'vue'
import { setupWebPage } from '../../shared/setupWebPage.js'

await setupWebPage()

const { default: Authentication } = await import('./AuthenticationApp.vue')

const AuthenticationApp = Vue.extend(Authentication)
new AuthenticationApp().$mount('#app')
