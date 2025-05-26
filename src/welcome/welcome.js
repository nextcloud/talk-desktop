/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { appData } from '../app/AppData.js'
import { refetchAppDataWithRetry } from '../app/appData.service.js'
import { initGlobals } from '../shared/globals/globals.js'
import { applyAxiosInterceptors } from '../shared/setupWebPage.js'

import '@global-styles/dist/icons.css'

const quitButton = document.querySelector('.quit')
quitButton.addEventListener('click', () => window.TALK_DESKTOP.quit())

if (__CHANNEL__ !== 'stable') {
	document.querySelector('.footer').textContent = __VERSION_TAG__
}

window.TALK_DESKTOP.getSystemInfo().then((os) => {
	quitButton.classList.remove('hidden')
	if (os.isMac) {
		quitButton.classList.add('quit_mac')
	}
})

appData.restore()

initGlobals()
applyAxiosInterceptors()

if (appData.credentials) {
	await window.TALK_DESKTOP.enableWebRequestInterceptor(appData.serverUrl, { credentials: appData.credentials })
	await refetchAppDataWithRetry(appData)
}

window.TALK_DESKTOP.sendAppData(appData.toJSON())
