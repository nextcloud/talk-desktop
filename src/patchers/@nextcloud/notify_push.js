/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* eslint-disable jsdoc/require-returns-type,jsdoc/require-param-description,jsdoc/require-jsdoc,jsdoc/require-param-type */

// Based on https://github.com/icewind1991/notify_push-client/blob/main/lib/index.ts
// TODO: Merge this module to the original repository

import { getCapabilities } from '@nextcloud/capabilities'
import { subscribe } from '@nextcloud/event-bus'
import axios from '@nextcloud/axios'

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
 * @param {object} [options] options
 * @param {{ user: string, password: string}} [options.credentials] Application credentials. If none is provided, pre-auth is used.
 * @return boolean whether or not push is setup correctly
 */
export function listen(name, handler, { credentials } = {}) {
	setupGlobals({ credentials })

	if (!window._notify_push_listeners[name]) {
		window._notify_push_listeners[name] = []
	}

	window._notify_push_listeners[name].push(handler)
	if (window._notify_push_ws !== null && typeof window._notify_push_ws === 'object') {
		window._notify_push_ws.send('listen ' + name)
	} else {
		setupSocket({ credentials })
	}

	return window._notify_push_available
}

/**
 * Setup notify_push
 *
 * @param {object} [options] options
 * @param {{ user: string, password: string}} [options.credentials] Application credentials. If none is provided, pre-auth is used.
 */
function setupGlobals({ credentials } = {}) {
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
			setupSocket({ credentials })
		})
	}
}

/**
 * Setup socket connection
 *
 * @param {object} [options] options
 * @param {{ user: string, password: string}} [options.credentials] Application credentials. If none is provided, pre-auth is used.
 */
async function setupSocket({ credentials } = {}) {
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

	let preAuth
	if (!credentials) {
		const response = await axios.post(capabilities.notify_push.endpoints.pre_auth)
		preAuth = response.data
	}

	window._notify_push_ws = new WebSocket(capabilities.notify_push.endpoints.websocket)
	window._notify_push_ws.onopen = () => {
		if (typeof window._notify_push_ws === 'object' && window._notify_push_ws) {
			if (preAuth) {
				window._notify_push_ws.send('')
				window._notify_push_ws.send(preAuth)
			} else if (credentials) {
				window._notify_push_ws.send(credentials.user)
				window._notify_push_ws.send(credentials.password)
			}

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
				setupSocket({ credentials })
			}
		}, 1000 * window._notify_push_error_count)
	}

	return true
}
