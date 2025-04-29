/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { AxiosError } from '@nextcloud/axios'

import { getCurrentUser } from '@nextcloud/auth'
import axios from '@nextcloud/axios'
import { generateOcsUrl } from '@nextcloud/router'
import { appData } from '../../app/AppData.js'

// @talk/src/types/openapi/openapi.ts/operations['call-get-peers-for-call']['responses'][200]['content']['application/json']
// TODO: find a way to import from @talk without type errors on CI
type CallGetParticipantsForCallResponse = {
	ocs: {
		meta: {
			status: string
			statuscode: number
			message?: string
			totalitems?: string
			itemsperpage?: string
		}
		data: {
			actorId: string
			actorType: string
			displayName: string
			/** Format: int64 */
			lastPing: number
			sessionId: string
			token: string
		}[]
	}
}

type CallNotificationStateResponse = {
	ocs: {
		meta: {
			status: string
			statuscode: number
			message?: string
			totalitems?: string
			itemsperpage?: string
		}
		data: unknown
	}
}

// TODO: this should be wrapped in a function to be used in separate callbox window
const getSupportCallNotificationStateApi = () => appData.capabilities?.spreed?.features?.includes('call-notification-state-api')

/**
 * Get participants of a call in a conversation
 *
 * @param token - Conversation token
 */
async function getCallParticipants(token: string) {
	const response = await axios.get<CallGetParticipantsForCallResponse>(generateOcsUrl('apps/spreed/api/v4/call/{token}', { token }))
	return response.data.ocs.data
}

/**
 * Get call notification state in a conversation
 *
 * @param token - Conversation token
 */
async function getCallNotificationState(token: string) {
	return axios.get<CallNotificationStateResponse>(generateOcsUrl('apps/spreed/api/v4/call/{token}/notification-state', { token }))
}

/**
 * Check if the current user has joined the call
 *
 * @param token - Conversation token
 * @return Promise<boolean|null> - whether participant is in the call (`null` if there is no current call)
 */
async function hasCurrentUserJoinedCall(token: string) {
	const user = getCurrentUser()
	if (!user) {
		throw new Error('Cannot check whether current join the call - no current user found')
	}

	if (getSupportCallNotificationStateApi()) {
		try {
			const response = await getCallNotificationState(token)
			if (response.data.ocs.meta.statuscode === 201) {
				// status code 201 returned, call missed
				return null
			} else {
				// status code 200 returned, user not joined yet and call notification is valid
				return false
			}
		} catch (exception) {
			if ((exception as AxiosError)?.response?.status === 404) {
				// status code 404 returned, user joined call already
				console.debug(exception)
				return true
			} else {
				throw exception
			}
		}
	}

	const participants = await getCallParticipants(token)
	if (!participants.length) {
		return null
	}
	return participants.some((participant) => user.uid === participant.actorId)
}

/**
 * Check if callbox should be rendered
 *
 * @param token - Conversation token
 * @return Promise<boolean> - Resolved with boolean - true if the user should see the callbox, false otherwise
 */
export async function checkCurrentUserHasPendingCall(token: string): Promise<boolean> {
	try {
		const response = await hasCurrentUserJoinedCall(token)
		if (response === null) {
			return false
		}
		return !response
	} catch (e) {
		console.warn('Error while checking if the user has pending call', e)
		return false
	}
}

/**
 * Wait until the current user has joined the call
 *
 * @param token - Conversation token
 * @param limit - The time limit in milliseconds to wait for the user to join the call, set to falsy to wait indefinitely
 * @return Promise<boolean> - Resolved with boolean - true if the user has joined the call, false if the limit has been reached
 */
export function waitCurrentUserHasJoinedCall(token: string, limit?: number): Promise<boolean> {
	const POLLING_INTERVAL = 2000

	const start = Date.now()

	return new Promise((resolve) => {
		(async function doCheck() {
			// Check for the limit
			if (limit && Date.now() - start > limit) {
				return resolve(false)
			}

			try {
				// Check if the user has joined the call
				const result = await hasCurrentUserJoinedCall(token)
				if (result === null) {
					return resolve(false)
				} else if (result === true) {
					return resolve(true)
				}
			} catch (e) {
				console.warn('Error while checking if the user has joined the call', e)
			}

			// Retry
			setTimeout(doCheck, POLLING_INTERVAL)
		})()
	})
}
