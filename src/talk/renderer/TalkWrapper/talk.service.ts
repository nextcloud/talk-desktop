/*
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { isNavigationFailure, NavigationFailureType } from '@talk/node_modules/vue-router'

/**
 * Get the Talk instance
 */
function getTalkInstance() {
	if (!window.OCA.Talk?.instance) {
		throw new Error('Talk is not initialized yet or not available')
	}
	return window.OCA.Talk.instance
}

/**
 * Get the Talk router
 */
function getTalkRouter() {
	return getTalkInstance().$router
}

/**
 * Get the current Talk route path
 */
export function getCurrentTalkRoutePath() {
	// TODO: add Vue 3 compatibility
	return getTalkRouter().currentRoute.fullPath
}

/**
 * Open the Talk root
 */
export function openRoot() {
	getTalkRouter().push({ name: 'root' }).catch(passDuplicatedNavigationError)
}

/**
 * Open a conversation in Talk
 * @param token - Conversation token
 * @param options - Options
 * @param options.directCall - Use direct call (open media settings to join a call)
 */
export async function openConversation(token: string, { directCall = false }: { directCall?: boolean } = {}) {
	await getTalkRouter().push({
		name: 'conversation',
		params: { token },
		hash: directCall ? '#direct-call' : undefined,
	}).catch(passDuplicatedNavigationError)

	await window.TALK_DESKTOP.focusTalk()
}

/**
 * Ignore duplicated navigation error
 * @param error - Error
 */
function passDuplicatedNavigationError(error: Error) {
	if (!isNavigationFailure(error, NavigationFailureType.duplicated)) {
		throw error
	}
}
