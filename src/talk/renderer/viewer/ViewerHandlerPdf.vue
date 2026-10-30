<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { ViewerEmits, ViewerProps } from '@nextcloud/viewer'

import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue'
import { getFileContent } from './files.service.ts'

const props = defineProps<ViewerProps>()
const emit = defineEmits<ViewerEmits>()

const maxWidthPx = computed(() => props.maxWidth + 'px')
const maxHeightPx = computed(() => props.maxHeight + 'px')

const src = ref<string>()

onBeforeMount(async () => {
	try {
		src.value = URL.createObjectURL(await getFileContent(props.file, 'blob'))
	} catch (error) {
		emit('errored', error as Error)
	}
})

onBeforeUnmount(() => {
	if (src.value) {
		URL.revokeObjectURL(src.value)
	}
})
</script>

<template>
	<div class="viewer-pdf">
		<iframe
			v-if="src"
			:src
			:title="file.displayname"
			:width="maxWidth"
			:height="maxHeight"
			@load="emit('loaded')" />
	</div>
</template>

<style scoped>
/* TODO: add stretch mode to @nextcloud/viewer to avoid setting size via JS */
.viewer-pdf {
	width: v-bind(maxWidthPx);
	height: v-bind(maxHeightPx);
	overflow: hidden;
}
</style>
