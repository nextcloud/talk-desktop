<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import { provide, ref } from 'vue'
import TitleBar from './TitleBar/TitleBar.vue'
import TalkWrapper from './TalkWrapper/TalkWrapper.vue'

const isTalkInitialized = ref(false)
provide('talk:isInitialized', isTalkInitialized)
</script>

<template>
	<div id="app">
		<div id="skip-actions" />
		<TitleBar id="header" />
		<TalkWrapper @ready="isTalkInitialized = true" />
	</div>
</template>
