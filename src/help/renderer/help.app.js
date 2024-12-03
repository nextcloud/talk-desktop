/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import '../../shared/assets/global.styles.css'
import './help.styles.css'

import Vue from 'vue'
import { setupWebPage } from '../../shared/setupWebPage.js'
import { markWindowReady } from '../../shared/markWindowReady.ts'

await setupWebPage()

const { default: HelpApp } = await import('./HelpApp.vue')
new Vue(HelpApp).$mount('#app')

markWindowReady()
