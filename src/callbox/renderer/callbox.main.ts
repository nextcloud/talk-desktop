/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import '../../shared/assets/global.styles.css'
import Vue from 'vue'
import { setupWebPage } from '../../shared/setupWebPage.js'
import CallboxApp from './CallboxApp.vue'

await setupWebPage()

new Vue(CallboxApp).$mount('#app')
