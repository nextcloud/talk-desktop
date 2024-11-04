/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { operations } from '@talk/src/types/openapi/openapi.ts'
import axios from '@nextcloud/axios'
import { getCurrentUser } from '@nextcloud/auth'
import { generateOcsUrl } from '@nextcloud/router'

type CallGetParticipantsForCall = operations['call-get-peers-for-call']['responses'][200]['content']['application/json']

/**
 * Get participants of a call in a conversation
 * @param token - Conversation token
 */
async function getCallParticipants(token: string) {
	const response = await axios.get<CallGetParticipantsForCall>(generateOcsUrl('apps/spreed/api/v4/call/{token}', { token }))
	return response.data.ocs.data
}

/**
 * Check if the current user has joined the call
 * @param token - Conversation token
 */
async function hasCurrentUserJoinedCall(token: string) {
	const user = getCurrentUser()
	if (!user) {
		throw new Error('Cannot check whether current join the call - no current user found')
	}
	const participants = await getCallParticipants(token)
	return participants.some((participant) => user.uid === participant.actorId)
}

/**
 * Wait until the current user has joined the call
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
				if (await hasCurrentUserJoinedCall(token)) {
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
