/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export type BroadcastEvents = {
	'talk:conversation:open': { token: string, directCall: boolean }
	'notifications:missedCall': { token: string, name: string, type: 'one2one' | 'group' | 'public', avatar: string }
}

export type BroadcastEventTypes = keyof BroadcastEvents

export const broadcastChannel = new BroadcastChannel('TalkDesktop')

/**
 * Broadcast a message to all windows
 *
 * @param type - Message type
 * @param payload - Message payload
 */
export function postBroadcast<T extends BroadcastEventTypes>(type: T, payload: BroadcastEvents[T]) {
	broadcastChannel.postMessage({ type, payload })
}

/**
 * Listen for a broadcast message
 *
 * @param type - Message type
 * @param callback - Callback function
 */
export function subscribeBroadcast<T extends BroadcastEventTypes>(type: T, callback: (payload: BroadcastEvents[T]) => void) {
	broadcastChannel.addEventListener('message', (event: MessageEvent<{ type: T, payload: BroadcastEvents[T] }>) => {
		if (typeof event.data !== 'object' || event.data.type !== type) {
			return
		}
		callback(event.data.payload)
	})
}
