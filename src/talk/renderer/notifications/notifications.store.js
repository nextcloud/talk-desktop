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

/* eslint-disable jsdoc/require-param-type,jsdoc/require-param-description */

/**
 * @see https://github.com/nextcloud/notifications/
 * @todo this is mostly a copy. Should be reusing.
 */

import { getRequestToken } from '@nextcloud/auth'
import { listen } from '@nextcloud/notify_push'
import { loadState } from '@nextcloud/initial-state'
import { getNotificationsData } from './notifications.service.js'
import { appData } from '../../../app/AppData.js'
import TalkRouter from '@talk/src/router/router.js'
import { generateFilePath } from '@nextcloud/router'
import { Howl } from 'howler'

/**
 *
 */
export function createNotificationStore() {
	let _oldcount = 0
	let notificationsSet = new Set()

	const state = {
		webNotificationsGranted: false,
		backgroundFetching: false,
		hasNotifyPush: false,
		shutdown: false,
		hasThrottledPushNotifications: loadState('notifications', 'throttled_push_notifications'),
		notifications: [],
		lastETag: null,
		lastTabId: null,
		userStatus: null,
		tabId: null,
		/** @type {number} */
		pollIntervalBase: 30000, // milliseconds
		/** @type {number} */
		pollIntervalCurrent: 30000, // milliseconds
		/** @type {number|null} */
		interval: null,
		pushEndpoints: null,
	}

	/* function userStatusUpdated({ userId, status }) {
		if (getCurrentUser().uid === userId) {
			STATE.userStatus = status
		}
	} */

	window.addEventListener('offline', () => {
		console.debug('Network is offline, slowing down pollingInterval to ' + state.pollIntervalBase * 10)
		_setPollingInterval(state.pollIntervalBase * 10)
	})

	window.addEventListener('online', () => {
		_fetch()
		console.debug('Network is online, reseting pollingInterval to ' + state.pollIntervalBase)
		_setPollingInterval(state.pollIntervalBase)
	})

	/**
	 *
	 */
	function setupBackgroundFetcher() {
		// if (OC.config.session_keepalive) {
		console.debug('Started background fetcher as session_keepalive is enabled')
		state.interval = window.setInterval(() => _backgroundFetch(), state.pollIntervalCurrent)
		// } else {
		// console.debug('Did not start background fetcher as session_keepalive is off')
		// }
	}

	/**
	 * Update the title to show * if there are new notifications
	 *
	 * @param {object} notifications The list of notifications
	 */
	function _updateDocTitleOnNewNotifications(notifications) {
		if (notifications.length > _oldcount) {
			_oldcount = notifications.length
			if (state.backgroundFetching && document.hidden) {
				// If we didn't already highlight, store the title so we can restore on tab-view
				if (!document.title.startsWith('* ')) {
					window.TALK_DESKTOP.setBadgeCount()
					document.title = '* ' + document.title
				}
			}
		}
	}

	/**
	 * Restore the title to remove a *
	 * Only restore title if it's still what we set it to,
	 * the Talk might have altered it.
	 */
	function _restoreTitle() {
		// Remove the badge
		window.TALK_DESKTOP.setBadgeCount(0)
		if (document.title.startsWith('* ')) {
			document.title = document.title.substring(2)
		}
	}

	/**
	 * Performs the AJAX request to retrieve the notifications
	 */
	function _fetchAfterNotifyPush() {
		state.backgroundFetching = true
		if (state.hasNotifyPush && state.tabId !== state.lastTabId) {
			console.debug('Deferring notification refresh from browser storage are notify_push event to give the last tab the chance to do it')
			setTimeout(() => {
				_fetch()
			}, 5000)
		} else {
			console.debug('Refreshing notifications are notify_push event')
			_fetch()
		}
	}

	/**
	 *
	 * @param isCall
	 */
	function playSound(isCall) {
		if (isCall) {
			if (loadState('notifications', 'sound_talk')) {
				const sound = new Howl({
					src: [
						generateFilePath('notifications', 'img', 'talk.ogg'),
					],
					volume: 0.5,
				})
				sound.play()
			}
		} else if (loadState('notifications', 'sound_notification')) {
			const sound = new Howl({
				src: [
					generateFilePath('notifications', 'img', 'notification.ogg'),
				],
				volume: 0.5,
			})
			sound.play()
		}
	}

	/**
	 *
	 * @param notification
	 */
	function showNativeNotification(notification) {
		if (notification.app !== 'spreed') {
			return
		}
		const [token, messageId] = notification.objectId.split('/')
		const n = new Notification(notification.subject, {
			title: notification.subject,
			lang: appData.userMetadata.locale,
			body: notification.message,
			icon: notification.icon,
			tag: notification.notificationId,
		})
		n.addEventListener('click', () => {
			TalkRouter.push({
				name: 'conversation',
				params: { token },
				hash: messageId && `#message_${messageId}`,
			})
			window.TALK_DESKTOP.focusTalk()
		}, false)
		playSound(notification.objectType === 'call')
	}

	/**
	 * Performs the AJAX request to retrieve the notifications
	 */
	async function _fetch() {
		const response = await getNotificationsData(state.tabId, state.lastETag, !state.backgroundFetching, state.hasNotifyPush)
		if (response.status === 204) {
			// 204 No Content - Intercept when no notifiers are there.
			console.debug('Fetching notifications but no content, slowing down polling to ' + state.pollIntervalBase * 10)
			_setPollingInterval(state.pollIntervalBase * 10)
		} else if (response.status === 200) {
			state.userStatus = response.headers['x-nextcloud-user-status']
			state.lastETag = response.headers.etag
			state.lastTabId = response.tabId
			state.notifications = response.data.filter((notification) => notification.app === 'spreed')
			const newNotifications = state.notifications.filter((notification) => !notificationsSet.has(notification.notificationId))
			notificationsSet = new Set(state.notifications.map((notification) => notification.notificationId))
			if (state.backgroundFetching) {
				for (const notification of newNotifications) {
					showNativeNotification(notification)
				}
			}
			console.debug('Got notification data')
			_setPollingInterval(state.pollIntervalBase)
			_updateDocTitleOnNewNotifications(state.notifications)
		} else if (response.status === 304) {
			// 304 - Not modified
			console.debug('No new notification data received')
			_setPollingInterval(state.pollIntervalBase)
		} else if (response.status === 503) {
			// 503 - Maintenance mode
			console.info('Slowing down notifications: instance is in maintenance mode.')
			_setPollingInterval(state.pollIntervalBase * 10)
		} else if (response.status === 404) {
			// 404 - App disabled
			console.info('Slowing down notifications: app is disabled.')
			_setPollingInterval(state.pollIntervalBase * 10)
		} else {
			console.info('Slowing down notifications: Status ' + response.status)
			_setPollingInterval(state.pollIntervalBase * 10)
		}
	}

	/**
	 *
	 */
	function _backgroundFetch() {
		state.backgroundFetching = true
		_fetch()
	}

	/**
	 *
	 */
	function _watchTabVisibility() {
		document.addEventListener('visibilitychange', _visibilityChange, false)
	}

	/**
	 *
	 */
	function _visibilityChange() {
		if (!document.hidden) {
			_restoreTitle()
		}
	}

	/**
	 *
	 * @param pollInterval
	 */
	function _setPollingInterval(pollInterval) {
		console.debug('Polling interval updated to ' + pollInterval)
		if (state.interval && pollInterval === state.pollIntervalCurrent) {
			return
		}
		if (state.interval) {
			window.clearInterval(state.interval)
			state.interval = null
		}
		state.pollIntervalCurrent = pollInterval
		setupBackgroundFetcher()
	}

	/**
	 * The app was disabled or has no notifiers, so we can stop polling
	 * And hide the UI as well
	 *
	 * @param {boolean} temporary If false, the notification bell will be hidden
	 */
	/* function _shutDownNotifications(temporary) {
		console.debug('Shutting down notifications ' + ((temporary) ? 'temporary' : 'bye'))
		if (STATE.interval) {
			window.clearInterval(STATE.interval)
			STATE.interval = null
		}
		STATE.shutdown = !temporary
	} */

	/**
	 * Check if we can do web notifications
	 */
	function checkWebNotificationPermissions() {
		if (!('Notification' in window)) {
			console.info('Browser does not support notifications')
			state.webNotificationsGranted = false
			return
		}
		if (window.Notification.permission === 'granted') {
			console.debug('Notifications permissions granted')
			state.webNotificationsGranted = true
			return
		}
		if (window.Notification.permission === 'denied') {
			console.debug('Notifications permissions denied')
			state.webNotificationsGranted = false
			return
		}
		if (window.location.protocol === 'http:') {
			console.debug('Notifications require HTTPS')
			state.webNotificationsGranted = false
			return
		}
		console.info('Notifications permissions not yet requested')
		state.webNotificationsGranted = null
	}

	/**
	 * Check if we can do web notifications
	 */
	async function requestWebNotificationPermissions() {
		if (state.webNotificationsGranted !== null) {
			return
		}
		console.info('Requesting notifications permissions')
		window.Notification.requestPermission()
			.then((permissions) => {
				state.webNotificationsGranted = permissions === 'granted'
			})
	}

	state.tabId = getRequestToken()
	// Bind the button click event
	console.debug('Registering notifications container as a menu')

	checkWebNotificationPermissions()

	// Initial call to the notification endpoint
	_fetch()

	const hasPush = listen('notify_notification', () => {
		_fetchAfterNotifyPush()
	}, { user: appData.credentials.user, password: appData.credentials.password })

	if (hasPush) {
		console.debug('Has notify_push enabled, slowing polling to 15 minutes')
		state.pollIntervalBase = 15 * 60 * 1000
		state.hasNotifyPush = true
	}
	// Set up the background checker
	_setPollingInterval(state.pollIntervalBase)
	_watchTabVisibility()

	requestWebNotificationPermissions()

	return {
		state,
	}
}

export const notificationsStore = createNotificationStore()
