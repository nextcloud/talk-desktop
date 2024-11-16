/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import '@shgk/nextcloud-styles'

import Vue from 'vue'
import UpgradeApp from './UpgradeApp.vue'
import { setupWebPage } from '../../shared/setupWebPage.js'

await setupWebPage()

new Vue(UpgradeApp).$mount('#app')
