/*
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { subscribe } from '@nextcloud/event-bus'

/**
 * Unread counts published by Talk via the public `talk:unread:updated` event.
 *
 * Mirrors Talk's `unreadCountsMap` computed property (spreed `src/App.vue`).
 */
type TalkUnreadCounts = {
	/** Number of non-archived conversations with unread messages */
	conversations: number
	/** Total number of unread messages */
	messages: number
	/** Number of conversations with an unread mention */
	mentions: number
	/** Number of conversations with an unread direct mention */
	mentionsDirect: number
}

declare module '@nextcloud/event-bus' {
	interface NextcloudEvents {
		'talk:unread:updated': TalkUnreadCounts
	}
}

let isInitialized = false

/**
 * Set the app badge counter according to Talk's unread message count.
 *
 * Subscribes to the public `talk:unread:updated` event emitted by Talk instead
 * of reading Talk's internal store, so it stays decoupled from Talk's state
 * management implementation. Talk emits the event immediately when its app is
 * created, so this must be called before Talk is mounted to receive the initial count.
 */
export function useBadgeCountIntegration(): void {
	// Subscribe only once
	if (isInitialized) {
		return
	}
	isInitialized = true

	subscribe('talk:unread:updated', (counts) => {
		window.TALK_DESKTOP.setBadgeCount(counts.messages)
	})
}
