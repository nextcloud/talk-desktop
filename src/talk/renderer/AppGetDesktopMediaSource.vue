<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup>
import { ref } from 'vue'

import DesktopMediaSourceDialog from './components/DesktopMediaSourceDialog.vue'

const props = defineProps({
	sources: {
		type: Array,
		required: true,
	},
})

const showDialog = ref(false)

let promiseWithResolvers = null

const handlePrompt = (sourceId) => {
	promiseWithResolvers.resolve({ sourceId })
	promiseWithResolvers = null
	showDialog.value = false
}

/**
 * Prompt user to select a desktop media source to share and return the selected sourceId or an empty string if canceled
 *
 * @return {Promise<{ sourceId: string }>} sourceId of the selected mediaSource or an empty string if canceled
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
	<DesktopMediaSourceDialog v-if="showDialog"
		:sources="sources"
		@submit="handlePrompt($event)"
		@cancel="handlePrompt('')" />
</template>
