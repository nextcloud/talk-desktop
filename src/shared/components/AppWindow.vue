<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import { watchEffect } from 'vue'

const props = defineProps<{
	title?: string
}>()

watchEffect(async () => {
	document.title = await window.TALK_DESKTOP.buildTitle(props.title)
})
</script>

<template>
	<div class="window">
		<slot />
	</div>
</template>

<style>
* {
	box-sizing: border-box;
}
</style>

<style scoped>
.window {
	height: 100vh;
}
</style>
