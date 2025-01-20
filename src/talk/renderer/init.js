/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { appData } from '../../app/AppData.js'

/**
 * @typedef TalkHashStoreAdapter
 * @property {(hash: string) => Promise<void>} setNextcloudTalkHash - Set Nextcloud Talk hash
 * @property {(callbacks: { onSetInitial: (hash: string) => void, onMarkDirty: () => void }) => void} onTalkHashChange - Listen to Nextcloud Talk hash changes
 */

/**
 * @param {import('vue').ComponentPublicInstance} talkInstance - Talk instance
 * @return {TalkHashStoreAdapter|null} - Pinia TalkHash store adapter or null if it is not available
 */
function createTalkHashStoreAdapter(talkInstance) {
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
