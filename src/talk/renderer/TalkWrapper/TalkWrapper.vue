<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { onTalkHashDirty, onTalkHashUpdate, openConversation, setTalkHash } from './talk.service.ts'
import { registerTalkDesktopSettingsSection } from '../Settings/index.ts'
import { subscribeBroadcast } from '../../../shared/broadcast.service.ts'
import { appData } from '../../../app/AppData.js'
import unreadCountStore, { EVENTS } from '@talk/src/store/unreadCountStore'
import { subscribe, emit as emitEvent } from '@nextcloud/event-bus'

const emit = defineEmits<{
	(event: 'ready'): void
}>()

// Handler for unread count updates
let unsubscribeUnreadCount: (() => void) | null = null

const waitForTalkAndStore = async () => {
	console.debug('TalkWrapper: Waiting for Talk instance and store...')
	let attempts = 0
	const maxAttempts = 50
	const delay = 100

	while (attempts < maxAttempts) {
		if (window.OCA?.Talk?.instance && window.store && window.TALK_DESKTOP) {
			console.debug('TalkWrapper: Talk instance, store, and TALK_DESKTOP found')
			return true
		}
		await new Promise(resolve => setTimeout(resolve, delay))
		attempts++
	}
	throw new Error('Talk instance, store, or TALK_DESKTOP not initialized after maximum attempts')
}

onMounted(async () => {
	try {
		await import('@talk/src/main.js')
		
		registerTalkDesktopSettingsSection()
		subscribeBroadcast('talk:conversation:open', ({ token, directCall }) => openConversation(token, { directCall }))

		await waitForTalkAndStore()
		const store = window.store

		// Register store module if not already registered
		if (!store.hasModule('unreadCount')) {
			store.registerModule('unreadCount', unreadCountStore)
		}

		// Initialize badge handling
		window.TALK_DESKTOP.setBadgeCount(0)

		// Subscribe to unread count updates
		unsubscribeUnreadCount = subscribe(EVENTS.UNREAD_COUNT_UPDATED, ({ unreadMessages }) => {
			window.TALK_DESKTOP.setBadgeCount(unreadMessages || 0)
		})

		// Now trigger the initial calculation
		store.dispatch('unreadCount/recalculateTotalUnreadCounters')

		if (appData.talkHash) {
			setTalkHash(appData.talkHash)
		}
		onTalkHashUpdate((hash: string) => {
			appData.setTalkHash(hash).persist()
		})
		onTalkHashDirty(() => {
			appData.setTalkHashDirty(true).persist()
		})

		emit('ready')
	} catch (error) {
		console.error('TalkWrapper: Error during initialization:', error)
	}
})

// Cleanup event listeners
onUnmounted(() => {
	if (unsubscribeUnreadCount) {
		unsubscribeUnreadCount()
	}
})
</script>

<template>
	<div id="content" />
</template>
