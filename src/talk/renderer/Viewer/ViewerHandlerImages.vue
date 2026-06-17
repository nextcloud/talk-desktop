<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup>
import panzoom from 'panzoom'
import { computed, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'
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

const panzoomWrapperRef = useTemplateRef('panzoomWrapper')
let instance = null
const scale = ref(1)
const grabbing = ref(false)

const cursorClass = computed(() => {
	if (scale.value === 1) {
		return 'viewer-image--zoom-in'
	}
	return grabbing.value ? 'viewer-image--grabbing' : 'viewer-image--grab'
})

function initPanzoom() {
	instance = panzoom(panzoomWrapperRef.value, {
		minZoom: ZOOM_MIN,
		maxZoom: ZOOM_MAX,
		bounds: true,
		boundsPadding: 0,
		beforeMouseDown() {
			return scale.value <= ZOOM_MIN
		},
	})
	instance.on('zoom', (pz) => {
		const transform = pz.getTransform()
		scale.value = transform.scale
		if (transform.scale <= ZOOM_MIN) {
			pz.smoothMoveTo(0, 0)
		}
	})
	instance.on('panstart', (pz) => {
		if (pz.getTransform().scale <= ZOOM_MIN) {
			return
		}
		grabbing.value = true
	})
	instance.on('panend', () => {
		grabbing.value = false
	})
}

function disposePanzoom() {
	instance?.dispose()
	instance = null
	scale.value = 1
	grabbing.value = false
}

/**
 * @param {Function} handleLoadEnd - Callback to signal load completion
 */
function onImageLoad(handleLoadEnd) {
	handleLoadEnd(false)
	initPanzoom()
}

/**
 * @param {Function} handleLoadEnd - Callback to signal load error
 */
function onImageError(handleLoadEnd) {
	handleLoadEnd(true)
	disposePanzoom()
}

/**
 * @param {MouseEvent} event - The double-click event
 */
function onDoubleClick(event) {
	if (!instance) {
		return
	}
	event.preventDefault()
	event.stopPropagation()
	const rect = event.currentTarget.getBoundingClientRect()
	const x = event.clientX - rect.left
	const y = event.clientY - rect.top
	if (scale.value === 1) {
		instance.smoothZoom(x, y, ZOOM_FACTOR)
	} else {
		instance.smoothZoomAbs(x, y, 0)
	}
}

watch(src, disposePanzoom)

onBeforeUnmount(disposePanzoom)
</script>

<template>
	<ViewerHandlerMedia v-slot="{ handleLoadEnd }">
		<!-- capture phase intercepts dblclick before panzoom's own handler; stopPropagation prevents the parent viewer from closing -->
		<div class="viewer-image-container" @dblclick.capture="onDoubleClick">
			<div ref="panzoomWrapper" class="viewer-image-wrapper">
				<img
					:key="src"
					class="viewer-image"
					:class="cursorClass"
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
