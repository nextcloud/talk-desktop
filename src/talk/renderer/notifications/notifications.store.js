/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* eslint-disable jsdoc/require-param-type,jsdoc/require-param-description */

/**
 * @see https://github.com/nextcloud/notifications/
 * @todo this is mostly a copy. Should be reusing.
 */

import { Howl } from 'howler'
import { listen } from '@nextcloud/notify_push'
import { loadState } from '@nextcloud/initial-state'
import { emit } from '@nextcloud/event-bus'
import { generateFilePath } from '@nextcloud/router'
import { t } from '@nextcloud/l10n'
import { getNotificationsData } from './notifications.service.js'
import { appData } from '../../../app/AppData.js'
import { useUserStatusStore } from '../UserStatus/userStatus.store.ts'
import { checkCurrentUserHasPendingCall } from '../../../callbox/renderer/callbox.service.ts'
import { getAppConfigValue } from '../../../shared/appConfig.service.ts'
import { subscribeBroadcast } from '../../../shared/broadcast.service.ts'
import { openConversation } from '../TalkWrapper/talk.service.ts'

const isTestNotificationApp = (notificationApp) => ['admin_notification_talk', 'admin_notifications'].includes(notificationApp)

/**
 *
 */
export function createNotificationStore() {
	const userStatusStore = useUserStatusStore()

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
		notificationThresholdId: 0,
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
				window.TALK_DESKTOP.flashAppIcon(true)
				// If we didn't already highlight, store the title so we can restore on tab-view
				if (!document.title.startsWith('* ')) {
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
		window.TALK_DESKTOP.flashAppIcon(false)
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
	 */
	function playSound() {
		if (!loadState('notifications', 'sound_notification')) {
			return
		}

		const sound = new Howl({
			src: [
				generateFilePath('notifications', 'img', 'notification.ogg'),
			],
			volume: 0.5,
		})
		sound.play()
	}

	/**
	 *
	 * @param notification
	 */
	async function showNativeNotification(notification) {
		if (isTestNotificationApp(notification.app)) {
			return showTestNotification(notification)
		}

		if (notification.app !== 'spreed') {
			return
		}
		if (notification.shouldNotify === false) {
			return
		}

		const isNotificationFromPendingCall = notification.objectType === 'call'
			&& await checkCurrentUserHasPendingCall(notification.objectId)

		const enableCallboxConfig = getAppConfigValue('enableCallbox')
		const shouldShowCallPopup = isNotificationFromPendingCall
			&& (enableCallboxConfig === 'always' || (enableCallboxConfig === 'respect-dnd' && !userStatusStore.isDnd))

		if (shouldShowCallPopup) {
			const params = {
				token: notification.objectId,
				name: notification.subjectRichParameters.call.name,
				type: notification.subjectRichParameters.call['call-type'],
				avatar: notification.subjectRichParameters.call['icon-url'],
			}
			window.TALK_DESKTOP.showCallbox(params)
		} else {
			const n = new Notification(notification.subject, {
				title: notification.subject,
				lang: appData.userMetadata.locale,
				body: notification.message,
				tag: notification.notificationId,
				// We have a custom sound
				silent: true,
			})
			n.addEventListener('click', () => {
				const event = {
					cancelAction: false,
					notification,
					action: {
						url: notification.link,
						type: 'WEB',
					},
				}
				window.TALK_DESKTOP.focusTalk()
				// Talk will open the call from notification if necessary
				emit('notifications:action:execute', event)
			}, false)
		}
		playSound()
	}

	/**
	 * Handle test notifications from "occ notification:test-push" or OCS Test Push Notification
	 * @param {object} notification - Notification DTO
	 */
	function showTestNotification(notification) {
		console.timeEnd('debug:notification:test-push')
		console.log('Test Notification Received', notification)
		const n = new Notification(notification.subject, {
			lang: appData.userMetadata.locale,
			body: notification.datetime,
			tag: notification.notificationId,
			icon: notification.icon,
			silent: true,
		})
		n.addEventListener('click', () => {
			console.log('Test Notification Clicked', notification)
			window.TALK_DESKTOP.focusTalk()
		})
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
			state.notifications = response.data.filter((notification) => notification.app === 'spreed' || isTestNotificationApp(notification.app))
			const newNotifications = state.notifications.filter((notification) => {
				return !notificationsSet.has(notification.notificationId) && notification.notificationId > state.notificationThresholdId
			})
			notificationsSet = new Set(state.notifications.map((notification) => notification.notificationId))
			state.notificationThresholdId = response.notificationThresholdId
			if (state.backgroundFetching) {
				for (const notification of newNotifications) {
					await showNativeNotification(notification)
					emit('notifications:notification:received', { notification })
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

	state.tabId = Math.random().toString(36).slice(2, 8)
	// Bind the button click event
	console.debug('Registering notifications container as a menu')

	checkWebNotificationPermissions()

	// Initial call to the notification endpoint
	_fetch()

	const hasPush = listen('notify_notification', _fetchAfterNotifyPush, {
		credentials: {
			username: appData.credentials.user,
			password: appData.credentials.password,
		},
	})

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

/**
 *
 */
export function useNotificationsStore() {
	return createNotificationStore()
}

subscribeBroadcast('notifications:missedCall', ({ token, name, type, avatar }) => {
	const title = type === 'one2one'
		? t('talk_desktop', 'You missed a call from {user}', { user: name })
		: t('talk_desktop', 'You missed a group call in {call}', { call: name })
	const notification = new Notification(title, {
		icon: avatar,
		lang: appData.userMetadata.locale,
		tag: Math.random().toString(36).slice(2, 6),
		silent: true,
	})
	notification.addEventListener('click', () => openConversation(token))
})
