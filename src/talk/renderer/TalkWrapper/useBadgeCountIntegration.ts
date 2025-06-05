/*
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { ref, watchEffect } from 'vue'

/**
 * Set badge counter according to Talk unread counts
 */
export function useBadgeCountIntegration() {
	const count = ref(0)

	window.OCA.Talk.instance.$store.watch(countUnreadConversations, (newValue: number) => {
		count.value = newValue
	}, { immediate: true })

	watchEffect(() => {
		window.TALK_DESKTOP.setBadgeCount(count.value)
	})
}

/**
 * Count conversations with unread notifications
 * HOTFIX: provide Talk API instead
 */
function countUnreadConversations() {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return window.OCA.Talk.instance.$store.getters.conversationsList.reduce((count: number, conversation: any) => {
		// Filter out archived conversations
		if (conversation.isArchived) {
			return count
		}

		// Muted with "Never notify"
		if (conversation.notificationLevel === 3) {
			return count
		}

		// ONE_TO_ONE || ONE_TO_ONE_FORMER
		if ((conversation.type === 1 || conversation.type === 5) && conversation.unreadMessages) {
			return count + 1
		}

		// Any other group conversation
		if (
			// Always notify && any unread message
			(conversation.notificationLevel === 1 && conversation.unreadMessages)
			// Mentioned
			|| conversation.unreadMention
		) {
			return count + 1
		}

		return count
	}, 0)
}
