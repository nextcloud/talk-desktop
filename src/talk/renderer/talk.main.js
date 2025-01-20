/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import '../../shared/assets/global.styles.css'
import '@talk/css/icons.css'
import './assets/styles.css'
import './assets/overrides.css'

import 'regenerator-runtime' // TODO: Why isn't it added on bundling
import { initTalkHashIntegration } from './init.js'
import { setupWebPage } from '../../shared/setupWebPage.js'
import { subscribeBroadcast } from '../../shared/broadcast.service.ts'
import { createViewer } from './Viewer/Viewer.js'
import { createDesktopApp } from './desktop.app.ts'
import { registerTalkDesktopSettingsSection } from './Settings/index.ts'
import { openConversation } from './utils/talk.service.ts'

// Initially open the welcome page, if not specified
await setupWebPage({
	routeHash: '#/apps/spreed',
})

createDesktopApp()

window.OCA.Viewer = await createViewer()

await import('@talk/src/main.js')

initTalkHashIntegration(window.OCA.Talk.instance)

window.OCA.Talk.Desktop.talkRouter.value = window.OCA.Talk.instance.$router

registerTalkDesktopSettingsSection()

await import('./notifications/notifications.store.js')

subscribeBroadcast('talk:conversation:open', ({ token, directCall }) => openConversation(token, { directCall }))
