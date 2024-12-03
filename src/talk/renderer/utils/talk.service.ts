/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Open a conversation in Talk
 * @param token - Conversation token
 * @param options - Options
 * @param options.directCall - Use direct call (open media settings to join a call)
 */
export async function openConversation(token: string, { directCall = false }: { directCall?: boolean } = {}) {
	if (!window.OCA.Talk?.instance) {
		throw new Error('Talk is not initialized yet or not available')
	}

	await window.OCA.Talk.instance.$router.push({
		name: 'conversation',
		params: { token },
		hash: directCall ? '#direct-call' : undefined,
	})

	await window.TALK_DESKTOP.focusTalk()
}
