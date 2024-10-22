/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import '../../shared/assets/global.styles.css'
import '@talk/css/icons.css'
import './assets/styles.css'
import './assets/overrides.css'

import 'regenerator-runtime' // TODO: Why isn't it added on bundling
import {
	initPlaySoundManagementOnUserStatus,
	initTalkHashIntegration,
} from './init.js'
import { setupWebPage } from '../../shared/setupWebPage.js'
import { createViewer } from './Viewer/Viewer.js'
import { createDesktopApp } from './desktop.app.js'
import { registerTalkDesktopSettingsSection } from './Settings/index.ts'

// Initially open the welcome page, if not specified
if (!window.location.hash) {
	window.location.hash = '#/apps/spreed'
}

await setupWebPage()

initPlaySoundManagementOnUserStatus()

createDesktopApp()

window.OCA.Viewer = await createViewer()

await import('@talk/src/main.js')

initTalkHashIntegration(window.OCA.Talk.instance)

window.OCA.Talk.Desktop.talkRouter.value = window.OCA.Talk.instance.$router

registerTalkDesktopSettingsSection()

await import('./notifications/notifications.store.js')
