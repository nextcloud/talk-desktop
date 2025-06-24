<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import { onMounted } from 'vue'
import { appData } from '../../../app/AppData.js'
import { subscribeBroadcast } from '../../../shared/broadcast.service.ts'
import { registerTalkDesktopSettingsSection } from '../Settings/index.ts'
import { onTalkHashDirty, onTalkHashUpdate, openConversation, setTalkHash } from './talk.service.ts'
import { useBadgeCountIntegration } from './useBadgeCountIntegration.ts'

const emit = defineEmits<{
	ready: []
}>()

onMounted(async () => {
	// Importing the main Talk entry point mounts a Vue app to the #content
	await import('@talk/src/main.js')

	// Additional integrations
	registerTalkDesktopSettingsSection()
	subscribeBroadcast('talk:conversation:open', ({ token, directCall }) => openConversation(token, { directCall }))
	useBadgeCountIntegration()

	// If there is a talkHash - set it initially
	if (appData.talkHash) {
		setTalkHash(appData.talkHash)
	}
	// Handle Talk Hash updates
	onTalkHashUpdate((hash: string) => {
		appData.setTalkHash(hash).persist()
	})
	onTalkHashDirty(() => {
		appData.setTalkHashDirty(true).persist()
	})

	// Ready
	emit('ready')
})
</script>

<template>
	<div id="content" />
</template>
