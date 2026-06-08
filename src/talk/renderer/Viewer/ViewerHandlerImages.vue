<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup>
import panzoom from 'panzoom'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import ViewerHandlerMedia from './ViewerHandlerMedia.vue'
import { generateFilePreviewUrl } from './viewer.utils.ts'

const props = defineProps({
	file: {
		type: Object,
		required: true,
	},
})
const ZOOM_MIN = 1
const ZOOM_MAX = 8
const ZOOM_FACTOR = 3

const src = computed(() => generateFilePreviewUrl(props.file.fileid, props.file.etag))

const ROTATION_STEP = 90

const wrapperRef = ref(null)
const instance = ref(null)
const scale = ref(1)
const grabbing = ref(false)
const rotation = ref(0)

const cursorClass = computed(() => {
	if (scale.value === 1) {
		return 'viewer-image--zoom-in'
	}
	return grabbing.value ? 'viewer-image--grabbing' : 'viewer-image--grab'
})

function initPanzoom() {
	if (!wrapperRef.value) {
		return
	}
	instance.value = panzoom(wrapperRef.value, {
		minZoom: ZOOM_MIN,
		maxZoom: ZOOM_MAX,
		bounds: true,
		boundsPadding: 0.1,
	})
	instance.value.on('zoom', (pz) => {
		const transform = pz.getTransform()
		scale.value = transform.scale
		if (transform.scale <= ZOOM_MIN) {
			pz.smoothMoveTo(0, 0)
		}
	})
	instance.value.on('panstart', (pz) => {
		if (pz.getTransform().scale <= ZOOM_MIN) {
			return
		}
		grabbing.value = true
	})
	instance.value.on('panend', () => {
		grabbing.value = false
	})
}

function disposePanzoom() {
	instance.value?.dispose()
	instance.value = null
	scale.value = 1
	grabbing.value = false
}

function rotateLeft() {
	rotation.value -= ROTATION_STEP
}

function rotateRight() {
	rotation.value += ROTATION_STEP
}

defineExpose({ rotateLeft, rotateRight })

function onImageLoad(handleLoadEnd) {
	handleLoadEnd(false)
	initPanzoom()
}

function onImageError(handleLoadEnd) {
	handleLoadEnd(true)
	disposePanzoom()
}

function onDoubleClick(event) {
	if (!instance.value) {
		return
	}
	event.preventDefault()
	event.stopPropagation()
	const rect = event.currentTarget.getBoundingClientRect()
	const x = event.clientX - rect.left
	const y = event.clientY - rect.top
	if (scale.value === 1) {
		instance.value.smoothZoom(x, y, ZOOM_FACTOR)
	} else {
		instance.value.smoothZoomAbs(x, y, 0)
	}
}

watch(src, () => {
	disposePanzoom()
	rotation.value = 0
})

onBeforeUnmount(disposePanzoom)
</script>

<template>
	<ViewerHandlerMedia v-slot="{ handleLoadEnd }">
		<div class="viewer-image-container" @dblclick.capture="onDoubleClick">
			<div ref="wrapperRef" class="viewer-image-wrapper" :class="cursorClass">
				<img
					:key="src"
					class="viewer-image"
					:style="{ transform: `rotate(${rotation}deg)` }"
					:src="src"
					:alt="file.basename"
					@load="onImageLoad(handleLoadEnd)"
					@error="onImageError(handleLoadEnd)">
			</div>
		</div>
	</ViewerHandlerMedia>
</template>

<style scoped>
.viewer-image-container {
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.viewer-image-wrapper {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.viewer-image {
	max-width: 100%;
	max-height: 100%;
	transition: transform 0.3s ease;
}

.viewer-image--zoom-in {
	cursor: zoom-in;
}

.viewer-image--grab {
	cursor: grab;
}

.viewer-image--grabbing {
	cursor: grabbing;
}
</style>
