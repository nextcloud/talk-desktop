<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import { provide, ref } from 'vue'
import AppWindow from '../../shared/components/AppWindow.vue'
import TalkWrapper from './TalkWrapper/TalkWrapper.vue'
import TitleBar from './TitleBar/TitleBar.vue'
import { useNotificationsStore } from './notifications/notifications.store.js'
import { createViewer } from './Viewer/Viewer.js'

const isTalkInitialized = ref(false)
provide('talk:isInitialized', isTalkInitialized)

useNotificationsStore()

window.OCA.Viewer = createViewer()
</script>

<template>
	<AppWindow>
		<div id="skip-actions" />
		<TitleBar id="header" />
		<TalkWrapper @ready="isTalkInitialized = true" />
	</AppWindow>
</template>
