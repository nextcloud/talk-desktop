<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="media-wrapper">
		<img :src="src" :alt="file.basename">
	</div>
</template>

<script>
import { generateUrl } from '@nextcloud/router'

export default {
	name: 'ViewerHandlerImages',

	props: {
		file: {
			type: Object,
			required: true,
		},
	},

	computed: {
		src() {
			if (!this.file) {
				return null
			}

			const searchParams = new URLSearchParams(Object.entries({
				fileId: this.file.fileid,
				x: Math.floor(screen.width * devicePixelRatio),
				y: Math.floor(screen.height * devicePixelRatio),
				a: 'true',
				etag: this.file.etag,
			})).toString()

			return generateUrl(`/core/preview?${searchParams}`)
		},
	},
}
</script>

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
