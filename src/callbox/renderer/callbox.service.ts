/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import axios from '@nextcloud/axios'
import { getCurrentUser } from '@nextcloud/auth'
import { generateOcsUrl } from '@nextcloud/router'
import { appData } from '../../app/AppData.js'

import type { AxiosError } from '@nextcloud/axios'

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
			actorId: string;
			actorType: string;
			displayName: string;
			/** Format: int64 */
			lastPing: number;
			sessionId: string;
			token: string;
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

const MISSED_CALL = 'missed_call'
const STATUS_MISSED_CALL = 201
const STATUS_NOT_FOUND = 404

/**
 * Get participants of a call in a conversation
 * @param token - Conversation token
 */
async function getCallParticipants(token: string) {
	const response = await axios.get<CallGetParticipantsForCallResponse>(generateOcsUrl('apps/spreed/api/v4/call/{token}', { token }))
	return response.data.ocs.data
}

/**
 * Get call notification state in a conversation
 * @param token - Conversation token
 */
async function getCallNotificationState(token: string) {
	return axios.get<CallNotificationStateResponse>(generateOcsUrl('apps/spreed/api/v4/call/{token}/notification-state', { token }))
}

/**
 * Check if the current user has joined the call
 * @param token - Conversation token
 * @param supportCallNotificationStateApi - Whether server supports notification state requests
 */
async function hasCurrentUserJoinedCall(token: string, supportCallNotificationStateApi: boolean) {
	const user = getCurrentUser()
	if (!user) {
		throw new Error('Cannot check whether current join the call - no current user found')
	}

	if (supportCallNotificationStateApi) {
		const response = await getCallNotificationState(token)
		if (response.data.ocs.meta.statuscode === STATUS_MISSED_CALL) {
			throw new Error('STATE - There are currently no participants in the call', { cause: MISSED_CALL })
		} else {
			// status code 200 returned, user not joined yet and call notification is valid
			return false
		}
	}

	const participants = await getCallParticipants(token)
	if (!participants.length) {
		throw new Error('There are currently no participants in the call', { cause: MISSED_CALL })
	}
	return participants.some((participant) => user.uid === participant.actorId)
}

/**
 * Check if callbox should be rendered
 * @param token - Conversation token
 * @return Promise<boolean> - Resolved with boolean - true if the user should see the callbox, false otherwise
 */
export async function checkCurrentUserHasPendingCall(token: string): Promise<boolean> {
	try {
		// FIXME does not work in callbox if defined outside of function scope
		const supportCallNotificationStateApi = appData.capabilities?.spreed?.features?.includes('call-notification-state-api')
		const response = await hasCurrentUserJoinedCall(token, supportCallNotificationStateApi)
		return !response
	} catch (e) {
		if (e instanceof Error && e.cause === MISSED_CALL) {
			console.debug(e)
		} else {
			console.warn('Error while checking if the user has pending call', e)
		}
		return false
	}
}

/**
 * Wait until the current user has joined the call
 * @param token - Conversation token
 * @param limit - The time limit in milliseconds to wait for the user to join the call, set to falsy to wait indefinitely
 * @return Promise<boolean> - Resolved with boolean - true if the user has joined the call, false if the limit has been reached
 */
export function waitCurrentUserHasJoinedCall(token: string, limit?: number): Promise<boolean> {
	const POLLING_INTERVAL = 2000
	const supportCallNotificationStateApi = appData.capabilities?.spreed?.features?.includes('call-notification-state-api')
	const start = Date.now()

	return new Promise((resolve) => {
		(async function doCheck() {
			// Check for the limit
			if (limit && Date.now() - start > limit) {
				return resolve(false)
			}

			try {
				// Check if the user has joined the call
				if (await hasCurrentUserJoinedCall(token, supportCallNotificationStateApi)) {
					return resolve(true)
				}
			} catch (e) {
				if (e instanceof Error && e.cause === MISSED_CALL) {
					console.debug(e)
					return resolve(false)
				} else if (supportCallNotificationStateApi && (e as AxiosError)?.response?.status === STATUS_NOT_FOUND) {
					// status code 404 returned, user joined call already
					console.debug(e)
					return resolve(true)
				}
				console.warn('Error while checking if the user has joined the call', e)
			}

			// Retry
			setTimeout(doCheck, POLLING_INTERVAL)
		})()
	})
}
