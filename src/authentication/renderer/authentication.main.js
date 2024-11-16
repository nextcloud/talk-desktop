/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import '@shgk/nextcloud-styles'

import Vue from 'vue'
import AuthenticationApp from './AuthenticationApp.vue'
import { setupWebPage } from '../../shared/setupWebPage.js'

await setupWebPage()

new Vue(AuthenticationApp).$mount('#app')
