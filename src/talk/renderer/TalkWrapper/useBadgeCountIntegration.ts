/*
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

let isInitialized = false

/**
 * Set badge counter according to Talk unread counts
 * Uses Vuex store.subscribe() to listen for conversation changes (event-driven, no polling)
 */
export function useBadgeCountIntegration(): void {
	// Prevent multiple initializations
	if (isInitialized) {
		return
	}
	isInitialized = true

	// Wait for store to be available, then subscribe to mutations
	const checkAndSubscribe = () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const store = (window as any).OCA?.Talk?.instance?.$store
		if (!store) {
			// Store not ready yet, retry in 500ms
			setTimeout(checkAndSubscribe, 500)
			return
		}

		// Set initial badge count
		const initialCount = countUnreadConversations()
		window.TALK_DESKTOP.setBadgeCount(initialCount)

		// Subscribe to store mutations - event-driven, no polling!
		store.subscribe((mutation: { type: string }) => {
			// Only recalculate when conversation-related mutations occur
			if (mutation.type === 'updateUnreadMessages' ||
				mutation.type === 'addConversation' ||
				mutation.type === 'updateConversation' ||
				mutation.type === 'deleteConversation') {
				const count = countUnreadConversations()
				window.TALK_DESKTOP.setBadgeCount(count)
			}
		})
	}

	checkAndSubscribe()
}

/**
 * Count conversations with unread notifications respecting notification settings
 *
 * Conversation types: 1=ONE_TO_ONE, 2=GROUP, 3=PUBLIC, 4=CHANGELOG, 5=ONE_TO_ONE_FORMER, 6=NOTE_TO_SELF
 * Notification levels: 1=Always, 2=Mention, 3=Never
 */
function countUnreadConversations(): number {
	try {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const conversationsList = (window as any).OCA?.Talk?.instance?.$store?.getters?.conversationsList
		if (!conversationsList) {
			return 0
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return conversationsList.reduce((count: number, conversation: any) => {
			// Filter out archived conversations
			if (conversation.isArchived) {
				return count
			}

			// Muted with "Never notify" - always skip
			if (conversation.notificationLevel === 3) {
				return count
			}

			// No unread messages - skip
			if (!conversation.unreadMessages) {
				return count
			}

			// ONE_TO_ONE or ONE_TO_ONE_FORMER - always count unread
			if (conversation.type === 1 || conversation.type === 5) {
				return count + 1
			}

			// NOTE_TO_SELF (type 6) - always count unread
			if (conversation.type === 6) {
				return count + 1
			}

			// Group conversations with "Always notify" - count all unread
			if (conversation.notificationLevel === 1) {
				return count + 1
			}

			// Group conversations with "Mention only" - only count if @mentioned
			if (conversation.notificationLevel === 2 && conversation.unreadMention) {
				return count + 1
			}

			return count
		}, 0)
	} catch {
		return 0
	}
}
