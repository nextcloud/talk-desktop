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

/*
	A dummy node to fix NcModal issue by adding the "last node".
	It must be added after other apps like Viewer are initialized to be truly "the last one".

	NcModal teleports itself BEFORE the last element in the container:
		NcModal / mounted() / document.body.insertBefore(this.$el, document.body.lastChild)
	Thus, if the current modal is the second modal, and there are no elements after the first modal, when the second modal will be open BEFORE the first one (under it).

	TODO: removed after using switching to Teleport: https://github.com/nextcloud-libraries/nextcloud-vue/pull/7514/
*/
document.body.appendChild(document.createElement('div'))
</script>

<template>
	<AppWindow>
		<div id="skip-actions" />
		<TitleBar id="header" />
		<TalkWrapper @ready="isTalkInitialized = true" />
	</AppWindow>
</template>
