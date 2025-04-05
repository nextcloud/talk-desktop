<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import { provide, ref, onMounted } from 'vue'
import TitleBar from './TitleBar/TitleBar.vue'
import TalkWrapper from './TalkWrapper/TalkWrapper.vue'
import { createViewer } from './Viewer/Viewer.js'
import { useNotificationsStore } from './notifications/notifications.store.js'
import unreadCountStore from '../../../spreed/src/store/unreadCountStore.js'

const isTalkInitialized = ref(false)
provide('talk:isInitialized', isTalkInitialized)

useNotificationsStore()

window.OCA.Viewer = createViewer()
</script>

<template>
	<div id="app">
		<div id="skip-actions" />
		<TitleBar id="header" />
		<TalkWrapper @ready="isTalkInitialized = true" />
	</div>
</template>
