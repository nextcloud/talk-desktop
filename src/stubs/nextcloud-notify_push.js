/*
 * @copyright Copyright (c) 2023 Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
 *
 * @author Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

// Based on https://github.com/icewind1991/notify_push-client/blob/main/lib/index.ts
// TODO: Merge this module to the original repository

import { getCapabilities } from '@nextcloud/capabilities'
import axios from '@nextcloud/axios'
import { subscribe } from '@nextcloud/event-bus'

/* declare global {
	interface Window {
		_notify_push_listeners: { [event: string]: ((string, any) => void)[] },
		_notify_push_ws: WebSocket | null | true,
			_notify_push_online: boolean,
			_notify_push_available: boolean,
			_notify_push_error_count: number,
	}
} */

/**
 * Get the list of supported notification types as reported by the server
 *
 * @return string[]
 */
export function getSupportedTypes() {
	const capabilities = getCapabilities()

	if (capabilities.notify_push) {
		return capabilities.notify_push.type
	} else {
		return []
	}
}

/**
 * Register a listener for notify_push events
 *
 * @param name name of the event
 * @param handler callback invoked for every matching event pushed
 * @return boolean whether or not push is setup correctly
 */
export function listen(name, handler, { user, password } = {}) {
	setupGlobals({ user, password })

	if (!window._notify_push_listeners[name]) {
		window._notify_push_listeners[name] = []
	}

	window._notify_push_listeners[name].push(handler)
	if (window._notify_push_ws !== null && typeof window._notify_push_ws === 'object') {
		window._notify_push_ws.send('listen ' + name)
	} else {
		setupSocket({ user, password })
	}

	return window._notify_push_available
}

function setupGlobals({ user, password } = {}) {
	if (typeof window._notify_push_listeners === 'undefined') {
		window._notify_push_listeners = {}
		window._notify_push_ws = null
		window._notify_push_online = true
		window._notify_push_available = false
		window._notify_push_error_count = 0

		subscribe('networkOffline', () => {
			window._notify_push_online = false
			window._notify_push_ws = null
		})
		subscribe('networkOnline', () => {
			window._notify_push_error_count = 0
			window._notify_push_online = true
			setupSocket({ user, password })
		})
	}
}

async function setupSocket({ user, password } = {}) {
	if (window._notify_push_ws) {
		return true
	}
	window._notify_push_ws = true

	const capabilities = getCapabilities()
	if (!capabilities.notify_push) {
		window._notify_push_available = false
		window._notify_push_ws = null
		return false
	}
	window._notify_push_available = true

	// const response = await axios.post(capabilities.notify_push.endpoints.pre_auth)

	window._notify_push_ws = new WebSocket(capabilities.notify_push.endpoints.websocket)
	window._notify_push_ws.onopen = () => {
		if (typeof window._notify_push_ws === 'object' && window._notify_push_ws) {
			window._notify_push_ws.send(user)
			window._notify_push_ws.send(password)

			for (const name in window._notify_push_listeners) {
				window._notify_push_ws.send('listen ' + name)
			}
		}
	}

	window._notify_push_ws.onmessage = message => {
		if (message.data === 'authenticated') {
			window._notify_push_error_count = 0
		} else {
			const i = message.data.indexOf(' ')
			let [event, body] = i > 0 ? [message.data.slice(0, i), message.data.slice(i + 1)] : [message.data, null]
			if (body) {
				body = JSON.parse(body)
			}

			if (window._notify_push_listeners[event]) {
				for (const cb of window._notify_push_listeners[event]) {
					cb(event, body)
				}
			}
		}
	}

	window._notify_push_ws.onerror = window._notify_push_ws.onclose = () => {
		window._notify_push_ws = null
		window._notify_push_error_count += 1

		setTimeout(() => {
			if (window._notify_push_online) {
				setupSocket()
			}
		}, 1000 * window._notify_push_error_count)
	}

	return true
}
