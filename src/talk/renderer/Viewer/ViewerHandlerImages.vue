<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup>
import { computed } from 'vue'
import { generateUrl } from '@nextcloud/router'

const props = defineProps({
	file: {
		type: Object,
		required: true,
	},
})

const src = computed(() => {
	if (!props.file) {
		return null
	}

	const searchParams = new URLSearchParams(Object.entries({
		fileId: props.file.fileid,
		x: Math.floor(screen.width * devicePixelRatio),
		y: Math.floor(screen.height * devicePixelRatio),
		a: 'true',
		etag: props.file.etag,
	})).toString()

	return generateUrl(`/core/preview?${searchParams}`)
})
</script>

<template>
	<div class="media-wrapper">
		<img :src="src" :alt="file.basename">
	</div>
</template>

<style scoped>
.media-wrapper {
	display: flex;
	height: 100%;
	width: 100%;
	justify-content: center;
	align-items: center;

	> * {
		max-width: 100%;
		max-height: 100%;
	}
}
</style>
