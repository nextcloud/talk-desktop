<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup>
import { computed, ref, watch } from 'vue'
import ViewerHandlerMedia from './ViewerHandlerMedia.vue'
import { generateFilePreviewUrl, generateUserFileDavUrl } from './viewer.utils.ts'

const props = defineProps({
	file: {
		type: Object,
		required: true,
	},
})

const failed = ref(false)

const src = computed(() => {
	return failed.value
		? generateUserFileDavUrl(props.file.filename)
		: generateFilePreviewUrl(props.file.fileid, props.file.etag)
})

watch(() => props.file, () => {
	failed.value = false
})

/**
 * Handle the failure of the preview image, falling back to the real file once before erroring out
 *
 * @param {(withError?: boolean | string) => void} handleLoadEnd - the callback handler from ViewerHandlerMedia
 */
function handleError(handleLoadEnd) {
	if (!failed.value) {
		failed.value = true
		return
	}
	handleLoadEnd(true)
}
</script>

<template>
	<ViewerHandlerMedia v-slot="{ mediaClass, handleLoadEnd }">
		<img
			:key="src"
			class="viewer-image"
			:class="mediaClass"
			:src="src"
			:alt="file.basename"
			@load="handleLoadEnd(false)"
			@error="handleError(handleLoadEnd)">
	</ViewerHandlerMedia>
</template>
