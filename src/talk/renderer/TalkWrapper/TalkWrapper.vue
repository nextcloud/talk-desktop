<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import { onMounted } from 'vue'
import { onTalkHashDirty, onTalkHashSetInitial, openConversation, setTalkHash } from './talk.service.ts'
import { registerTalkDesktopSettingsSection } from '../Settings/index.ts'
import { subscribeBroadcast } from '../../../shared/broadcast.service.ts'
import { appData } from '../../../app/AppData.js'

const emit = defineEmits<{
	(event: 'ready'): void
}>()

onMounted(async () => {
	// Importing the main Talk entry point mounts a Vue app to the #content
	await import('@talk/src/main.js')

	// Additional integrations
	registerTalkDesktopSettingsSection()
	subscribeBroadcast('talk:conversation:open', ({ token, directCall }) => openConversation(token, { directCall }))

	// If there is a talkHash - set it initially
	if (appData.talkHash) {
		setTalkHash(appData.talkHash)
	}
	// Handle Talk Hash updates
	onTalkHashSetInitial((hash: string) => {
		appData.setTalkHash(hash).persist()
	})
	onTalkHashDirty(() => {
		appData.setTalkHashDirty(true).persist()
		// TODO: make soft restart (!)
		window.TALK_DESKTOP.relaunch()
	})

	// Ready
	emit('ready')
})
</script>

<template>
	<div id="content" />
</template>
