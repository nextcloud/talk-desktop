<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup>
import { computed } from 'vue'
import { generateRemoteUrl } from '@nextcloud/router'
import { getCurrentUser } from '@nextcloud/auth'

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

	return generateRemoteUrl(`dav/files/${getCurrentUser().uid}/${props.file.filename}`)
})
</script>

<template>
	<div class="media-wrapper">
		<video :src="src" controls />
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
