<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup>
import { ref } from 'vue'
import ViewerHandlerBase from './ViewerHandlerBase.vue'

const loading = ref(true)
const error = ref(false)

/**
 * Handle the end of the loading process
 *
 * @param {boolean | string} withError - Whether the loading process ended with an error
 */
function handleLoadEnd(withError = false) {
	loading.value = false
	error.value = withError
}
</script>

<template>
	<ViewerHandlerBase :loading="loading" :error="error" lazy>
		<slot :handle-load-end="handleLoadEnd" media-class="viewer-media" />
	</ViewerHandlerBase>
</template>

<style scoped>
:deep(.viewer-media) {
	object-fit: scale-down;
}
</style>
