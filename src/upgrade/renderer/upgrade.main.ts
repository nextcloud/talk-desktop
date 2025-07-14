/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { t } from '@nextcloud/l10n'
import Vue from 'vue'
import { setupWebPage } from '../../shared/setupWebPage.js'

import '../../shared/assets/global.styles.css'

await setupWebPage({
	title: () => t('talk_desktop', 'Upgrade required'),
})

const { default: Upgrade } = await import('./UpgradeApp.vue')

const UpgradeApp = Vue.extend(Upgrade)
new UpgradeApp().$mount('#app')
