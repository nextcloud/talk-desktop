/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { t } from '@nextcloud/l10n'
import Vue from 'vue'
import { setupWebPage } from '../../shared/setupWebPage.js'

import '../../shared/assets/global.styles.css'
import './help.styles.css'

await setupWebPage({
	title: () => t('talk_desktop', 'About'),
})

const { default: Help } = await import('./HelpApp.vue')

const HelpApp = Vue.extend(Help)
new HelpApp().$mount('#app')
