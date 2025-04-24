<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup>
import { computed } from 'vue'
import ViewerHandlerMedia from './ViewerHandlerMedia.vue'
import { generateUserFileDavUrl } from './viewer.utils.ts'

const props = defineProps({
	file: {
		type: Object,
		required: true,
	},
})

const src = computed(() => generateUserFileDavUrl(props.file.filename))
</script>

<template>
	<ViewerHandlerMedia v-slot="{ mediaClass, handleLoadEnd }">
		<video
			class="viewer-video"
			:class="mediaClass"
			:src="src"
			controls
			@canplay="handleLoadEnd(false)"
			@error="handleLoadEnd(true)" />
	</ViewerHandlerMedia>
</template>
