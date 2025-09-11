/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { setupWebPage } from '../../shared/setupWebPage.js'
import { createTalkDesktopApp } from './TalkDesktop.app.ts'

import '../../shared/assets/global.styles.css'
import '@talk/src/icons.css'
import './assets/styles.css'
import './assets/overrides.css'
import 'regenerator-runtime' // TODO: Why isn't it added on bundling

// Initially open the Welcome page, if not specified
await setupWebPage()

await createTalkDesktopApp()

// HOTFIX: prevent invalid links <a href="#"> used in NcListItem as a button from breaking routing in Vue Router 4 with Hash History
// TODO: fix on NcListItem side and use real buttons instead of <a href="#">
document.addEventListener('click', (event) => {
	const emptyAnchorLink = (event.target as HTMLElement).closest('a[href="#"]')
	if (emptyAnchorLink) {
		event.preventDefault()
	}
})
