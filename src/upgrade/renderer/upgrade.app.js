/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import '../../shared/assets/global.styles.css'

import Vue from 'vue'
import UpgradeApp from './UpgradeApp.vue'
import { setupWebPage } from '../../shared/setupWebPage.js'
import { markWindowReady } from '../../shared/markWindowReady.ts'

await setupWebPage()

new Vue(UpgradeApp).$mount('#app')

markWindowReady()
