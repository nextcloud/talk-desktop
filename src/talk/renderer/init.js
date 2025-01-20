/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { appData } from '../../app/AppData.js'
import { onTalkHashDirty, onTalkHashSetInitial, setTalkHash } from './TalkWrapper/talk.service.ts'

/**
 * @param {import('vue').ComponentPublicInstance} talkInstance - Talk instance
 */
export function initTalkHashIntegration() {
	// If there is a talkHash - set it initially
	if (appData.talkHash) {
		setTalkHash(appData.talkHash)
	}

	// Handle Talk Hash updates
	onTalkHashSetInitial((hash) => {
		appData.setTalkHash(hash).persist()
	})

	onTalkHashDirty(() => {
		appData.setTalkHashDirty(true).persist()
		// TODO: make soft restart (!)
		window.TALK_DESKTOP.relaunch()
	})
}
