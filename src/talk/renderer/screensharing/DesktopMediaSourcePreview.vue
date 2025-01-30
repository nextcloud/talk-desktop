<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { ScreensharingSource } from './screensharing.types.ts'
import IconMonitor from 'vue-material-design-icons/Monitor.vue'
import IconApplicationOutline from 'vue-material-design-icons/ApplicationOutline.vue'
import IconVolumeHigh from 'vue-material-design-icons/VolumeHigh.vue'
import DesktopMediaSourcePreviewLive from './DesktopMediaSourcePreviewLive.vue'

// On Wayland getting each stream for the live preview requests user to select the source via system dialog again
// Instead - show static images.
// See: https://github.com/electron/electron/issues/27732
const previewType = window.systemInfo.isWayland ? 'thumbnail' : 'live'

defineProps<{
	source: ScreensharingSource
	selected: boolean
}>()

const emit = defineEmits<{
	(event: 'select'): void
	(event: 'suspend'): void
}>()
</script>

<template>
	<label :key="source.id" class="capture-source">
		<input :id="source.id"
			class="capture-source__input"
			type="radio"
			:value="source.id"
			:checked="selected"
			@change="emit('select')">

		<DesktopMediaSourcePreviewLive v-if="previewType === 'live'"
			class="capture-source__preview"
			:media-source-id="source.id"
			@suspend="emit('suspend')" />
		<img v-else-if="previewType === 'thumbnail' && source.thumbnail"
			alt=""
			:src="source.thumbnail"
			class="capture-source__preview">
		<span v-else class="capture-source__preview" />

		<span class="capture-source__caption">
			<img v-if="source.icon"
				alt=""
				:src="source.icon"
				class="capture-source__caption-icon">
			<IconVolumeHigh v-else-if="source.id.startsWith('entire-desktop:')" :size="16" />
			<IconMonitor v-else-if="source.id.startsWith('screen:')" :size="16" />
			<IconApplicationOutline v-else-if="source.id.startsWith('window:')" :size="16" />
			<span class="capture-source__caption-text">{{ source.name }}</span>
		</span>
	</label>
</template>

<style scoped lang="scss">
.capture-source {
	display: flex;
	flex-direction: column;
	gap: var(--default-grid-baseline);
	overflow: hidden;

	&__input {
		position: absolute;
		z-index: -1;
		opacity: 0 !important;
		width: var(--default-clickable-area);
		height: var(--default-clickable-area);
		margin: 4px 14px;
	}

	&__preview {
		aspect-ratio: 16 / 9;
		object-fit: contain;
		width: calc(100% - 4px - 4px);
		flex: 1 0;
		margin: 4px auto;
		border-radius: var(--border-radius-large);
	}

	&:focus &__preview,
	&:hover &__preview {
		box-shadow: 0 0 0 2px var(--color-primary-element);
		background-color: var(--color-background-hover);
	}

	&:has(&__input:checked) &__preview {
		box-shadow: 0 0 0 4px var(--color-primary-element);
		background-color: var(--color-background-hover);
	}

	&__caption {
		display: flex;
		gap: var(--default-grid-baseline);
		align-items: center;
		padding: var(--default-grid-baseline);
	}

	&__caption-icon {
		height: 16px;
	}

	&__caption-text {
		text-wrap: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
}
</style>
