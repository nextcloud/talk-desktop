/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { loadServerCss } from '../../shared/resource.utils.js'
import { appData } from '../../app/AppData.js'
import { getCapabilities } from '../../shared/ocs.service.js'
import { setInitialState } from '../../shared/initialState.service.js'
import { subscribe } from '@nextcloud/event-bus'
import { getCurrentUser } from '@nextcloud/auth'

/**
 * @return {Promise<void>}
 */
export async function initServerStyles() {
	// Load application styles from server
	await Promise.all([
		loadServerCss('/apps/theming/css/default.css'),
		loadServerCss('/index.php/apps/theming/theme/light.css'),
		loadServerCss('/index.php/apps/theming/theme/dark.css'),
		loadServerCss('/core/css/server.css'),
	]).catch(async () => {
		// It is not possible to determine why styles loading failed in a web-browser
		// There are 2 the most likely reasons:
		// 1. Invalid authentication (401 or 500)
		// 2. Server is unavailable

		// Request any data from the server to check
		await getCapabilities()
	}).catch((error) => {
		// Problem #1 is handled globally
		// For problem #2 - just quit until the app supports opening offline
		if (![401, 500].includes(error.response?.status)) {
			// Mark Talk hash dirty to check server availability on the next app start
			appData.setTalkHashDirty(true).persist()
			alert(t('talk_desktop', 'Cannot connect to the server. Please check your internet connection and try again later.'))
			window.TALK_DESKTOP.quit()
		}
	})
}

/**
 * @return {Promise<void>}
 */
export async function initLocalStyles() {
	// Load styles overrides
	await import('./assets/overrides.css')
}

/**
 * @typedef TalkHashStoreAdapter
 * @property {(hash: string) => Promise<void>} setNextcloudTalkHash - Set Nextcloud Talk hash
 * @property {(callbacks: { onSetInitial: (hash: string) => void, onMarkDirty: () => void }) => void} onTalkHashChange - Listen to Nextcloud Talk hash changes
 */

/**
 * @param {import('vue').ComponentPublicInstance} talkInstance - Talk instance
 * @return {TalkHashStoreAdapter|null} - Pinia TalkHash store adapter or null if it is not available
 */
function createTalkHashPiniaAdapter(talkInstance) {
	let useTalkHashStore
	try {
		useTalkHashStore = require(/* wrappedContextCritical: false */ '@talk/src/stores/talkHash.js').useTalkHashStore
	} catch {
		return null
	}

	const talkHashStore = useTalkHashStore(talkInstance.$pinia)
	const setNextcloudTalkHash = (hash) => talkHashStore.setNextcloudTalkHash(hash)
	const onTalkHashChange = ({
		onSetInitial,
		onMarkDirty,
	}) => {
		talkHashStore.$onAction(({
			name,
			after,
		}) => {
			if (name !== 'setNextcloudTalkHash') {
				return
			}
			after(() => {
				if (talkHashStore.isNextcloudTalkHashDirty) {
					onMarkDirty()
				} else {
					onSetInitial(talkHashStore.initialNextcloudTalkHash)
				}
			})
		})
	}
	return {
		setNextcloudTalkHash,
		onTalkHashChange,
	}
}

/**
 * @param {import('vue').ComponentPublicInstance} talkInstance - Talk instance
 * @return {TalkHashStoreAdapter|null} - Vuex TalkHash store adapter or null if it is not available for hash
 */
function createTalkHashVuexAdapter(talkInstance) {
	let store
	try {
		store = require('@talk/src/store/index.js').default
	} catch {
		return null
	}

	if (!store.hasModule('talkHashStore')) {
		return null
	}

	const setNextcloudTalkHash = async (hash) => store.dispatch('setNextcloudTalkHash', appData.talkHash)
	const onTalkHashChange = ({
		onSetInitial,
		onMarkDirty,
	}) => {
		store.subscribe((mutation, state) => {
			if (mutation.type === 'setInitialNextcloudTalkHash') {
				onSetInitial(state.talkHashStore.initialNextcloudTalkHash)
			} else if (mutation.type === 'markNextcloudTalkHashDirty') {
				onMarkDirty()
			}
		})
	}
	return {
		setNextcloudTalkHash,
		onTalkHashChange,
	}
}

/**
 * @param {import('vue').ComponentPublicInstance} talkInstance - Talk instance
 * @return {Promise<TalkHashStoreAdapter>}
 */
function createTalkHashStoreAdapter(talkInstance) {
	// Talk is using Pinia only since v19 (Nextcloud 29)
	// Use Vuex as a fallback
	return createTalkHashPiniaAdapter(talkInstance) ?? createTalkHashVuexAdapter(talkInstance)
}

/**
 * @param {import('vue').ComponentPublicInstance} talkInstance - Talk instance
 */
export function initTalkHashIntegration(talkInstance) {
	const { setNextcloudTalkHash, onTalkHashChange } = createTalkHashStoreAdapter(talkInstance)

	// If there is a talkHash - set it before the app start
	if (appData.talkHash) {
		setNextcloudTalkHash(appData.talkHash)
	}

	onTalkHashChange({
		onSetInitial: (hash) => appData.setTalkHash(hash).persist(),
		onMarkDirty: () => {
			appData.setTalkHashDirty(true).persist()
			// TODO: make soft restart?
			window.TALK_DESKTOP.relaunch()
		},
	})
}

/**
 * Enable or disable the sound for notifications and calls on DND user status change
 */
export function initPlaySoundManagementOnUserStatus() {
	subscribe('user_status:status.updated', (userStatus) => {
		if (userStatus.userId !== getCurrentUser().uid) {
			return
		}
		// TODO: add setting to define the default value for playSound
		const playSoundDefault = true
		// Disable if DND
		const playSound = userStatus.status === 'dnd' ? false : playSoundDefault
		// Notification's sound in the Notifications app is controlled via initial state only
		setInitialState('notifications', 'sound_notification', playSound)
		setInitialState('notifications', 'sound_talk', playSound)
	})
}
