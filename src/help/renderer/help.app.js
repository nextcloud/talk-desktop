/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import '../../shared/assets/global.styles.css'
import './help.styles.css'

import Vue, { defineAsyncComponent } from 'vue'
import { setupWebPage } from '../../shared/setupWebPage.js'

await setupWebPage()

const HelpApp = defineAsyncComponent(() => import('./HelpApp.vue'))
new Vue({
	name: 'HelpAppRoot',
	render: h => h(HelpApp),
}).$mount('#app')
