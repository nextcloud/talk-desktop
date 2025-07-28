/*
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Vue from 'vue'
import { setupWebPage } from '../../shared/setupWebPage.js'

import '../../shared/assets/global.styles.css'

await setupWebPage()

const { default: CertificateApp } = await import('./CertificateApp.vue')

new (Vue.extend(CertificateApp))().$mount('#app')
