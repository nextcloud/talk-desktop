<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { ScreensharingSource } from './screensharing.types.ts'

import { t } from '@nextcloud/l10n'
import IconApplicationOutline from 'vue-material-design-icons/ApplicationOutline.vue'
import IconMonitor from 'vue-material-design-icons/Monitor.vue'
import IconVolumeHigh from 'vue-material-design-icons/VolumeHigh.vue'
import DesktopMediaSourcePreviewLive from './DesktopMediaSourcePreviewLive.vue'

defineProps<{
	source: ScreensharingSource
	live: boolean
	selected: boolean
}>()

const emit = defineEmits<{
	select: []
	suspend: []
}>()
</script>

<template>
	<label :key="source.id" class="capture-source">
		<input
			:id="source.id"
			class="capture-source__input"
			type="radio"
			:value="source.id"
			:checked="selected"
			@change="emit('select')">

		<DesktopMediaSourcePreviewLive
			v-if="live"
			class="capture-source__preview"
			:media-source-id="source.id"
			@suspend="emit('suspend')" />
		<img
			v-else-if="source.thumbnail"
			alt=""
			:src="source.thumbnail"
			class="capture-source__preview">
		<span v-else class="capture-source__preview capture-source__preview-unavailable">
			{{ t('talk_desktop', 'Preview is not available') }}
		</span>

		<span class="capture-source__caption">
			<img
				v-if="source.icon"
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
	border-radius: var(--border-radius-element);
	padding: calc(2 * var(--default-grid-baseline));
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
		width: 100%;
		border-radius: var(--border-radius-small);
		flex: 1 0;
	}

	&__preview-unavailable {
		background-color: var(--color-background-hover);
		display: grid;
		place-content: center;
		color: var(--color-text-maxcontrast);
		font-size: 120%;
	}

	&:focus,
	&:hover {
		background-color: var(--color-background-hover);
		outline: 2px solid var(--color-primary-element);
		outline-offset: 2px;
	}

	&:has(&__input:checked) {
		background-color: var(--color-primary-element);
		color: var(--color-primary-text);

		.capture-source__caption-text {
			font-weight: bolder;
		}
	}

	&__caption {
		display: flex;
		gap: 1ch;
		align-items: center;
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
