<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { ScreensharingSource } from '../../../screensharing/screensharing.types.ts'

import { ref } from 'vue'
import DesktopMediaSourceDialog from './DesktopMediaSourceDialog.vue'

const showDialog = ref<boolean>(false)

let promiseWithResolvers: PromiseWithResolvers<ScreensharingSource | null> | null = null

/**
 * @param source - Selected screensharing source or null if canceled
 */
function handlePrompt(source: ScreensharingSource | null) {
	promiseWithResolvers!.resolve(source)
	promiseWithResolvers = null
	showDialog.value = false
}

/**
 * Prompt user to select a desktop media source to share and return the selected source or null if canceled
 *
 * @return the selected mediaSource or null if canceled
 */
function promptDesktopMediaSource() {
	if (promiseWithResolvers) {
		return promiseWithResolvers.promise
	}
	showDialog.value = true
	promiseWithResolvers = Promise.withResolvers()
	return promiseWithResolvers.promise
}

defineExpose({ promptDesktopMediaSource })
</script>

<template>
	<DesktopMediaSourceDialog v-if="showDialog" @submit="handlePrompt($event)" @cancel="handlePrompt(null)" />
</template>
