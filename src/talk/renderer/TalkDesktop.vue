<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import { provide, ref } from 'vue'
import { useHotKey } from '@nextcloud/vue/composables/useHotKey'
import TitleBar from './TitleBar/TitleBar.vue'
import TalkWrapper from './TalkWrapper/TalkWrapper.vue'
import { openRoot } from './TalkWrapper/talk.service.ts'
import { createViewer } from './Viewer/Viewer.js'
import { useNotificationsStore } from './notifications/notifications.store.js'

const isTalkInitialized = ref(false)
provide('talk:isInitialized', isTalkInitialized)

useNotificationsStore()

window.OCA.Viewer = createViewer()

// Unselect chat by escape key
useHotKey('Escape', openRoot)
</script>

<template>
	<div id="app">
		<div id="skip-actions" />
		<TitleBar id="header" />
		<TalkWrapper @ready="isTalkInitialized = true" />
	</div>
</template>
