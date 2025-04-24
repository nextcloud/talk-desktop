<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup>
import { computed } from 'vue'
import ViewerHandlerMedia from './ViewerHandlerMedia.vue'
import { generateFilePreviewUrl } from './viewer.utils.ts'

const props = defineProps({
	file: {
		type: Object,
		required: true,
	},
})

const src = computed(() => generateFilePreviewUrl(props.file.fileid, props.file.etag))
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
			@error="handleLoadEnd(true)">
	</ViewerHandlerMedia>
</template>
