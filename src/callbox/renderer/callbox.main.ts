/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import '../../shared/assets/global.styles.css'

import Vue from 'vue'
import { setupWebPage } from '../../shared/setupWebPage.js'

await setupWebPage()

const { default: Callbox } = await import('./CallboxApp.vue')

const CallboxApp = Vue.extend(Callbox)
new CallboxApp().$mount('#app')
