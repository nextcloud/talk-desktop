<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { ScreensharingSourceId } from './screensharing.types.ts'

import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import NcLoadingIcon from '@nextcloud/vue/components/NcLoadingIcon'

const props = defineProps<{
	mediaSourceId: ScreensharingSourceId
}>()

const emit = defineEmits<{
	suspend: []
}>()

const videoElement = useTemplateRef('videoElement')
let stream: MediaStream | null = null
const isReady = ref(false)

/**
 * Get the stream for the media source
 *
 * @param mediaSourceId - The media source ID
 */
function getStreamForMediaSource(mediaSourceId: ScreensharingSourceId) {
	const MAX_PREVIEW_SIZE = 1024
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
	stream = await getStreamForMediaSource(props.mediaSourceId)
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
	await setVideoSource()
})

onBeforeUnmount(() => {
	releaseVideoSource()
})

/**
 * Handle the loadedmetadata event of the video element
 *
 * @param event - The event
 */
function onLoadedMetadata(event: Event) {
	isReady.value = true
	;(event.target as HTMLVideoElement).play()
}

/**
 * Handle the suspend event of the video element
 * This is supposed to happen only if the source disappears, e.g., the source window is closed
 */
function onSuspend() {
	if (videoElement.value!.srcObject) {
		emit('suspend')
	}
}
</script>

<template>
	<div class="live-preview">
		<video
			v-show="isReady"
			ref="videoElement"
			class="live-preview__video"
			muted
			@loadedmetadata="onLoadedMetadata"
			@suspend="onSuspend" />
		<span v-if="!isReady" class="live-preview__placeholder">
			<NcLoadingIcon :size="40" />
		</span>
	</div>
</template>

<style scoped>
.live-preview {
	max-width: 100%;
}

.live-preview__video {
	width: 100%;
	height: 100%;
}

.live-preview__placeholder {
	border-radius: var(--border-radius-small);
	background-color: var(--color-background-hover);
	color: var(--color-text-maxcontrast);
	display: grid;
	place-content: center;
	width: 100%;
	height: 100%;
}
</style>
