<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import type { ScreensharingSourceId } from './screensharing.types.ts'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
	mediaSourceId: ScreensharingSourceId
}>()

const emit = defineEmits<{
	(event: 'suspend'): void
}>()

const videoElement = ref<HTMLVideoElement | null>(null)

/**
 * Get the stream for the media source
 * @param mediaSourceId - The media source ID
 */
function getStreamForMediaSource(mediaSourceId: ScreensharingSourceId) {
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
	videoElement.value!.srcObject = await getStreamForMediaSource(props.mediaSourceId)
}

/**
 * Release the video source
 */
function releaseVideoSource() {
	const stream = videoElement.value!.srcObject! as MediaStream
	for (const track of stream.getTracks()) {
		track.stop()
	}
	videoElement.value!.srcObject = null
}

onMounted(async () => {
	await setVideoSource()
})

onBeforeUnmount(() => {
	// Release the stream, otherwise it is still captured even if no video element is using it
	releaseVideoSource()
})

/**
 * Handle the loadedmetadata event of the video element
 * @param event - The event
 */
function onLoadedMetadata(event: Event) {
	(event.target as HTMLVideoElement).play()
}

/**
 *
 */
function onSuspend() {
	if (videoElement.value!.srcObject) {
		emit('suspend')
	}
}
</script>

<template>
	<video ref="videoElement"
		muted
		@loadedmetadata="onLoadedMetadata"
		@suspend="onSuspend" />
</template>

<style scoped lang="scss">

</style>
