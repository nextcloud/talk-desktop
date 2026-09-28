/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Credentials } from './loginFlow.utils.ts'

import { openInBrowser } from '../app/utils.ts'
import { createWaiter } from '../shared/utils.ts'
import { getLoginFlowDeviceName } from './loginFlow.utils.ts'
import { initLoginFlowV2, pollLoginFlowV2 } from './loginFlowV2.service.ts'

/**
 * Entire login flow v2 timeout, the server-side constant for token expiration.
 * Not exposed in capabilities.
 *
 * @see https://github.com/nextcloud/server/blob/v35.0.0/core/Db/LoginFlowV2Mapper.php#L21
 */
const LOGIN_FLOW_V2_POLLING_TIMEOUT = 20 * 60 * 1_000

/**
 * Login flow v2 timeout between polling requests
 */
const LOGIN_FLOW_V2_POLLING_INTERVAL = 15 * 1_000

export type LoginFlowV2 = Awaited<ReturnType<typeof createLoginFlowV2>>

/**
 * Initiate the login flow v2 process
 *
 * @see https://docs.nextcloud.com/server/35/developer_manual/client_apis/LoginFlow/index.html
 * @param serverUrl - Server URL
 * @param onPollingChange - Callback notifying about the polling state change
 * @return - Login flow v2 instance to control the process and wait for the result
 * @throws {Error} - Failed login flow v2 init request
 */
export async function createLoginFlowV2(serverUrl: string, onPollingChange: (isPolling: boolean) => void) {
	const { login: loginUrl, poll } = await initLoginFlowV2(serverUrl, getLoginFlowDeviceName())

	const { promise, resolve } = Promise.withResolvers<Credentials | Error>()
	const abortController = new AbortController()
	const timeoutId = setTimeout(() => resolve(new Error('TIMEOUT')), LOGIN_FLOW_V2_POLLING_TIMEOUT)
	const pollingWaiter = createWaiter(LOGIN_FLOW_V2_POLLING_INTERVAL, abortController.signal)

	void promise.finally(() => {
		clearTimeout(timeoutId)
		abortController.abort()
	})

	/**
	 * Start polling to get the credentials
	 */
	async function startPolling() {
		while (await pollingWaiter.wait()) {
			onPollingChange(true)
			const credentials = await pollLoginFlowV2(poll.endpoint, poll.token)
			onPollingChange(false)

			if (credentials) {
				// Convert to the previous format
				// TODO: rework when credentials are moved to AppContext
				return resolve({
					server: serverUrl,
					user: credentials.loginName,
					password: credentials.appPassword,
				})
			}
		}
	}

	return {
		/**
		 * Login page URL
		 */
		loginUrl,

		/**
		 * Login via initialized login flow v2: wait for the flow to complete and get the result
		 */
		login() {
			void startPolling()
			return promise
		},

		/**
		 * Open Login Flow v2 landing page in the default web browser
		 */
		open: () => openInBrowser(loginUrl),

		/**
		 * Immediately check the login flow v2 status
		 */
		refresh: () => pollingWaiter.wake(),

		/**
		 * Abort the login flow v2 process
		 */
		abort: () => resolve(new Error('ABORTED')),
	}
}
