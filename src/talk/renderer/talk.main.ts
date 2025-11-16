/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { setupWebPage } from '../../shared/setupWebPage.js'
import { createTalkDesktopApp } from './TalkDesktop.app.ts'

import '../../shared/assets/styles.css'
import '@talk/src/icons.css'
import './talk.styles.css'

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
