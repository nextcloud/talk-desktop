<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { ScreensharingSourceId } from './screensharing.types.ts'

import { ref } from 'vue'
import DesktopMediaSourceDialog from './DesktopMediaSourceDialog.vue'

const showDialog = ref<boolean>(false)

let promiseWithResolvers: PromiseWithResolvers<{ sourceId: ScreensharingSourceId | '' }> | null = null

/**
 * @param sourceId - Selected screensharing sourceID
 */
function handlePrompt(sourceId: ScreensharingSourceId | '') {
	promiseWithResolvers!.resolve({ sourceId })
	promiseWithResolvers = null
	showDialog.value = false
}

/**
 * Prompt user to select a desktop media source to share and return the selected sourceId or an empty string if canceled
 *
 * @return sourceId of the selected mediaSource or an empty string if canceled
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
	<DesktopMediaSourceDialog v-if="showDialog" @submit="handlePrompt($event)" @cancel="handlePrompt('')" />
</template>
