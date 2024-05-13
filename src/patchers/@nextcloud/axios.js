/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import axios from '@desktop-modules--@nextcloud/axios'

axios.interceptors.request.use((config) => {
	config.withCredentials = true
	config.headers['OCS-APIRequest'] = 'true'
	return config
}, (error) => Promise.reject(error))

let upgradeInterceptorHasBeenTriggeredOnce = false

axios.interceptors.response.use((response) => response, (error) => {
	if (error?.response?.status === 401) {
		window.TALK_DESKTOP.logout()
	}
	if (error?.response?.status === 426) {
		if (!upgradeInterceptorHasBeenTriggeredOnce) {
			upgradeInterceptorHasBeenTriggeredOnce = true
			window.TALK_DESKTOP.showUpgrade()
		}
	}
	return Promise.reject(error)
})

export default axios
