/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import '@global-styles/dist/icons.css'

import { appData } from '../app/AppData.js'
import { refetchAppDataIfDirty } from '../app/appData.service.js'
import { initGlobals } from '../shared/globals/globals.js'
import { applyAxiosInterceptors } from '../shared/setupWebPage.js'

const quitButton = document.querySelector('.quit')
quitButton.addEventListener('click', () => window.TALK_DESKTOP.quit())

const logoutButton = document.querySelector('.logout')
logoutButton.addEventListener('click', () => window.TALK_DESKTOP.logout())

window.TALK_DESKTOP.getSystemInfo().then(os => {
	quitButton.classList.remove('hidden')
	if (os.isMac) {
		quitButton.classList.add('quit_mac')
	}
})

appData.restore()

initGlobals()
applyAxiosInterceptors()

if (appData.credentials) {
	logoutButton.classList.remove('hidden')
	await window.TALK_DESKTOP.enableWebRequestInterceptor(appData.serverUrl, { enableCors: true, enableCookies: true, credentials: appData.credentials })
	await refetchAppDataIfDirty(appData)
}

window.TALK_DESKTOP.sendAppData(appData.toJSON())
