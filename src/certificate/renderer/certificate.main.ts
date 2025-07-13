/*
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { t } from '@nextcloud/l10n'
import { createApp } from 'vue'
import { setupWebPage } from '../../shared/setupWebPage.js'

import '../../shared/assets/global.styles.css'

await setupWebPage({
	title: () => t('talk_desktop', 'Security warning'),
})

const { default: CertificateApp } = await import('./CertificateApp.vue')

createApp(CertificateApp).mount('#app')
