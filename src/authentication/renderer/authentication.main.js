/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { t } from '@nextcloud/l10n'
import Vue from 'vue'
import { setupWebPage } from '../../shared/setupWebPage.js'

import '../../shared/assets/global.styles.css'

await setupWebPage({
	title: () => t('talk_desktop', 'Authentication'),
})

const { default: Authentication } = await import('./AuthenticationApp.vue')

const AuthenticationApp = Vue.extend(Authentication)
new AuthenticationApp().$mount('#app')
