<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup>
import panzoom from 'panzoom'
import { computed, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'
import { translate as t } from '@nextcloud/l10n'
import IconRotateLeft from 'vue-material-design-icons/RotateLeft.vue'
import IconRotateRight from 'vue-material-design-icons/RotateRight.vue'
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
const ROTATION_STEP = 90

const src = computed(() => generateFilePreviewUrl(props.file.fileid, props.file.etag))

const panzoomWrapperRef = useTemplateRef('panzoomWrapper')
let instance = null
const scale = ref(1)
const grabbing = ref(false)
const rotation = ref(0)

const cursorClass = computed(() => {
	if (scale.value === 1) {
		return 'viewer-image--zoom-in'
	}
	return grabbing.value ? 'viewer-image--grabbing' : 'viewer-image--grab'
})

function clampToBounds() {
	if (!instance) return
	const el = panzoomWrapperRef.value
	const rect = el.getBoundingClientRect()
	const parentRect = el.parentElement.getBoundingClientRect()
	const { x, y } = instance.getTransform()

	let newX = x
	let newY = y
	if (rect.left > parentRect.left) newX -= rect.left - parentRect.left
	if (rect.right < parentRect.right) newX += parentRect.right - rect.right
	if (rect.top > parentRect.top) newY -= rect.top - parentRect.top
	if (rect.bottom < parentRect.bottom) newY += parentRect.bottom - rect.bottom

	if (newX !== x || newY !== y) {
		instance.moveTo(newX, newY)
	}
}

function initPanzoom() {
	instance = panzoom(panzoomWrapperRef.value, {
		minZoom: ZOOM_MIN,
		maxZoom: ZOOM_MAX,
		// Disable inertia so the image stops immediately on release,
		// allowing clampToBounds to take effect without being overridden
		smoothScroll: false,
		beforeMouseDown() {
			return scale.value <= ZOOM_MIN
		},
	})
	instance.on('zoom', (pz) => {
		const transform = pz.getTransform()
		scale.value = transform.scale
		if (transform.scale <= ZOOM_MIN) {
			pz.smoothMoveTo(0, 0)
		} else {
			clampToBounds()
		}
	})
	instance.on('panstart', (pz) => {
		if (pz.getTransform().scale <= ZOOM_MIN) {
			return
		}
		grabbing.value = true
	})
	instance.on('pan', () => {
		clampToBounds()
	})
	instance.on('panend', () => {
		grabbing.value = false
		clampToBounds()
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
		instance.smoothZoomAbs(x, y, ZOOM_MIN)
	}
}

function rotateLeft() {
	rotation.value -= ROTATION_STEP
}

function rotateRight() {
	rotation.value += ROTATION_STEP
}

const actions = computed(() => [
	{ key: 'rotate-left', label: t('talk_desktop', 'Rotate left'), icon: IconRotateLeft, onClick: rotateLeft },
	{ key: 'rotate-right', label: t('talk_desktop', 'Rotate right'), icon: IconRotateRight, onClick: rotateRight },
])

defineExpose({ actions })

watch(src, () => {
	disposePanzoom()
	rotation.value = 0
})

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
