/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { MESSAGE } from '@talk/src/constants.ts'
import { useAppConfigStore } from '../Settings/appConfig.store.ts'

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Last message id of each archived conversation, by conversation token */
type ArchivedLastMessageIds = Record<string, number>

/**
 * Unarchive an archived conversation automatically when a new message is posted in it.
 * Controlled by the "unarchiveOnNewMessage" application config.
 */
export function useAutoUnarchiveIntegration() {
	const appConfigStore = useAppConfigStore()
	const store = window.OCA.Talk.instance.$store

	/** Tokens of conversations with an unarchive request in progress */
	const pendingTokens = new Set<string>()

	/**
	 * Unarchive a conversation
	 *
	 * @param token - Conversation token
	 */
	async function unarchive(token: string) {
		pendingTokens.add(token)
		try {
			// Talk's action toggles the state: "isArchived: true" results in unarchiving
			await store.dispatch('toggleArchive', { token, isArchived: true })
		} catch (error) {
			console.error('Failed to unarchive the conversation', token, error)
		} finally {
			pendingTokens.delete(token)
		}
	}

	store.watch(getArchivedLastMessageIds, (newIds: ArchivedLastMessageIds, oldIds: ArchivedLastMessageIds) => {
		if (!appConfigStore.getAppConfigValue('unarchiveOnNewMessage')) {
			return
		}

		for (const [token, lastMessageId] of Object.entries(newIds)) {
			const knownLastMessageId = oldIds[token]
			// Newly loaded or just archived: remember the current state only
			if (knownLastMessageId === undefined) {
				continue
			}

			if (lastMessageId > knownLastMessageId && !pendingTokens.has(token)) {
				unarchive(token)
			}
		}
	})
}

/**
 * Get the id of the last posted message for every archived conversation
 *
 * @param state - Talk store state
 * @param getters - Talk store getters
 */
function getArchivedLastMessageIds(state: unknown, getters: any): ArchivedLastMessageIds {
	const result: ArchivedLastMessageIds = {}

	for (const conversation of getters.conversationsList) {
		if (conversation.isArchived) {
			result[conversation.token] = getLastPostedMessageId(conversation)
		}
	}

	return result
}

/**
 * Get the id of the last message posted by a participant in a conversation
 *
 * @param conversation - Conversation
 * @return The message id or 0 if there is no such message
 */
function getLastPostedMessageId(conversation: any): number {
	const lastMessage = conversation.lastMessage

	// The server provides an empty array when there is no last message
	if (!lastMessage || Array.isArray(lastMessage)) {
		return 0
	}

	if (lastMessage.messageType === MESSAGE.TYPE.SYSTEM || lastMessage.messageType === MESSAGE.TYPE.COMMENT_DELETED) {
		return 0
	}

	return lastMessage.id ?? 0
}
