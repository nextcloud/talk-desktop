/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { net } from 'electron'

export type CoreLoginFlowV2ApiResponse = {
	poll: {
		token: string
		endpoint: string
	}
	login: string
}

export type CoreLoginFlowV2CredentialsApiResponse = {
	server: string
	loginName: string
	appPassword: string
}

/**
 * Request login flow v2 initiation
 *
 * @param serverUrl - Server URL
 * @param deviceName - Device name to identify the session (app password/token) and display it on the "Grant access" page in the browser
 * @throws {Error} - Failed login flow v2 init request
 */
export async function initLoginFlowV2(serverUrl: string, deviceName: string): Promise<CoreLoginFlowV2ApiResponse> {
	try {
		const response = await net.fetch(serverUrl + '/index.php/login/v2', {
			method: 'POST',
			headers: {
				// Though device name does not have a valid User-Agent format,
				// this is where the login flow API expects to find the device name.
				// Used on login flow page and then on the Personal settings / Security / Devices & Sessions
				'User-Agent': deviceName,
			},
			// Bypass handler to keep the custom User-Agent
			bypassCustomProtocolHandlers: true,
		})
		if (!response.ok) {
			throw new Error(`Init login flow v2 request failed: ${response.status} ${response.statusText}`)
		}
		return await response.json() as CoreLoginFlowV2ApiResponse
	} catch (error) {
		console.error('Init login flow v2 request failed:', error)
		throw error
	}
}

/**
 * Request poll login flow credentials
 *
 * @param endpoint - Polling endpoint from the init login flow response
 * @param token - Polling token from the init login flow response
 * @return the credentials on successful login or null in any other case, never throws
 */
export async function pollLoginFlowV2(endpoint: string, token: string): Promise<CoreLoginFlowV2CredentialsApiResponse | null> {
	try {
		const body = new FormData()
		body.append('token', token)
		const response = await net.fetch(endpoint, { method: 'POST', body })
		if (!response.ok) {
			// 404 is the only expected error when the user has not completed the login flow or token is invalid
			if (response.status !== 404) {
				console.error('Unexpected login flow v2 polling error:', response.status, response.statusText)
			}
			// 'Token not yet ready' or 'Apptoken could not be decrypted' errors
			return null
		}
		return await response.json() as CoreLoginFlowV2CredentialsApiResponse
	} catch (error) {
		console.error('Unexpected login flow v2 polling error:', error)
		return null
	}
}
