/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import '../../shared/assets/global.styles.css'
import '@talk/css/icons.css'
import './assets/styles.css'
import './assets/overrides.css'

import 'regenerator-runtime' // TODO: Why isn't it added on bundling
import { setupWebPage } from '../../shared/setupWebPage.js'
import { createTalkDesktopApp } from './TalkDesktop.app.ts'

await setupWebPage()

await createTalkDesktopApp()
