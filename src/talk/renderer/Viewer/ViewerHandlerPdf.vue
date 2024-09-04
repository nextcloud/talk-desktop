<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup>
import { computed } from 'vue'
import { toRef } from '@vueuse/core'
import { useFileContent } from './viewer.composables.ts'
import ViewerHandlerBase from './ViewerHandlerBase.vue'

const props = defineProps({
	file: {
		type: Object,
		required: true,
	},
})

const { content, loading, error } = useFileContent(toRef(() => props.file.filename), 'binary')

const src = computed(() => content.value ? URL.createObjectURL(content.value) : undefined)
</script>

<template>
	<ViewerHandlerBase :loading="loading" :error="error">
		<iframe v-if="src" :src="src" />
	</ViewerHandlerBase>
</template>
