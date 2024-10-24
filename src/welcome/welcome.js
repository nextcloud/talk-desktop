/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import './welcome.css'

import { appData } from '../app/AppData.js'
import { refetchAppDataIfDirty } from '../app/appData.service.js'
import { initGlobals } from '../shared/globals/globals.js'
import { applyAxiosInterceptors } from '../shared/setupWebPage.js'

const INSTALLING_GIF = false

if (!INSTALLING_GIF) {
	const quitButton = document.querySelector('.quit')
	quitButton?.addEventListener('click', () => window.TALK_DESKTOP.quit())

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
		await window.TALK_DESKTOP.enableWebRequestInterceptor(appData.serverUrl, { enableCors: true, enableCookies: true, credentials: appData.credentials })
		await refetchAppDataIfDirty(appData)
	}

	// window.TALK_DESKTOP.sendAppData(appData.toJSON())
}
