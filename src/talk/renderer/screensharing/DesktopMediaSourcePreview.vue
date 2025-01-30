<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { ScreensharingSource, ScreensharingSourceId } from './screensharing.types.ts'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import IconMonitor from 'vue-material-design-icons/Monitor.vue'
import IconApplicationOutline from 'vue-material-design-icons/ApplicationOutline.vue'
import IconVolumeHigh from 'vue-material-design-icons/VolumeHigh.vue'

// On Wayland getting each stream for the live preview requests user to select the source via system dialog again
// Instead - show static images.
// See: https://github.com/electron/electron/issues/27732
const previewType = window.systemInfo.isWayland ? 'thumbnail' : 'live'

const videoElement = ref<HTMLVideoElement | null>(null)
let stream: MediaStream | null = null

const props = defineProps<{
	source: ScreensharingSource
	selected: boolean
}>()

const emit = defineEmits<{
	(event: 'select'): void
	(event: 'suspend'): void
}>()

const getStreamForMediaSource = (mediaSourceId: ScreensharingSourceId) => {
	const MAX_PREVIEW_SIZE = 320
	// Special case for sharing all the screens with desktop audio in Electron
	// In this case, it must have exactly these constraints
	// "entire-desktop:0:0" is a custom sourceId for this specific case
	const constraints = mediaSourceId === 'entire-desktop:0:0'
		? {
			audio: {
				mandatory: {
					chromeMediaSource: 'desktop',
				},
			},
			video: {
				mandatory: {
					chromeMediaSource: 'desktop',
					maxWidth: MAX_PREVIEW_SIZE,
					maxHeight: MAX_PREVIEW_SIZE,
				},
			},
		}
		: {
			audio: false,
			video: {
				mandatory: {
					chromeMediaSource: 'desktop',
					chromeMediaSourceId: mediaSourceId,
					maxWidth: MAX_PREVIEW_SIZE,
					maxHeight: MAX_PREVIEW_SIZE,
				},
			},
		}

	// @ts-expect-error Each browser has a different API, the current object is compatible with Chromium
	return navigator.mediaDevices.getUserMedia(constraints)
}

/**
 * Set the video source to the selected source
 */
async function setVideoSource() {
	stream = await getStreamForMediaSource(props.source.id)
	if (videoElement.value) {
		videoElement.value.srcObject = stream
	} else {
		// If there is no video element - something went wrong or the component is destroyed already
		// We still must release the stream
		releaseVideoSource()
	}
}

/**
 * Release the video source
 */
function releaseVideoSource() {
	if (!stream) {
		return
	}
	for (const track of stream.getTracks()) {
		track.stop()
	}
}

onMounted(async () => {
	if (previewType === 'live') {
		await setVideoSource()
	}
})

onBeforeUnmount(() => {
	releaseVideoSource()
})

/**
 * Handle the loadedmetadata event of the video element
 * @param event - The event
 */
function onLoadedMetadata(event: Event) {
	(event.target as HTMLVideoElement).play()
}
</script>

<template>
	<label :key="source.id" class="capture-source">
		<input :id="source.id"
			class="capture-source__input"
			type="radio"
			:value="source.id"
			:checked="selected"
			@change="emit('select')">

		<video v-if="previewType === 'live'"
			ref="videoElement"
			class="capture-source__preview"
			muted
			@loadedmetadata="onLoadedMetadata"
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
