/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { t } from '@nextcloud/l10n'
import { createApp } from 'vue'
import { setupWebPage } from '../../shared/setupWebPage.js'

import '../../shared/assets/global.styles.css'
import './help.styles.css'

await setupWebPage({
	title: () => t('talk_desktop', 'About'),
})

const { default: HelpApp } = await import('./HelpApp.vue')

createApp(HelpApp).mount('#app')
