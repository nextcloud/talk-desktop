/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { appData } from '../app/AppData.js'
import { refetchAppDataWithRetry } from '../app/appData.service.js'
import { getAppConfigValue, initAppConfig, setAppConfigValue } from '../shared/appConfig.service.ts'
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
	// Init accounts in case this is the first run with the new config
	// TODO: replace with a proper migration when the migration system supports it
	await initAppConfig()
	const accounts = getAppConfigValue('accounts')
	if (!accounts.length) {
		await setAppConfigValue('accounts', [`${appData.credentials.user}@${appData.serverUrl.replace(/^https?:\/\//, '')}`])
	}
}

window.TALK_DESKTOP.sendAppData(appData.toJSON())
