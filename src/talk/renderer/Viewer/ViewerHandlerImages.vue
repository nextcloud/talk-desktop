<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup>
import { translate as t } from '@nextcloud/l10n'
import panzoom from 'panzoom'
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
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
// Smooth zoom animations in panzoom undershoot their target by up to ~0.1%
// of the zoom range (amator never calls step() for the final t=1 frame), so
// after zooming out the scale is ~1.002..1.007, never exactly 1. All
// fit-state checks go through this epsilon, and the 'zoomend' handler snaps
// the settled scale back to exactly ZOOM_MIN.
const SCALE_EPSILON = 0.01

const src = computed(() => generateFilePreviewUrl(props.file.fileid, props.file.etag))

const panzoomWrapperRef = useTemplateRef('panzoomWrapper')
const imageRef = useTemplateRef('image')
let instance = null
const scale = ref(1)
const grabbing = ref(false)
const rotation = ref(0)
// Extra downscale so an image rotated by an odd number of quarter turns
// still fits the container
const rotationFitScale = ref(1)
// Fit box of the *image* (not the wrapper) in unscaled container coordinates.
// Built from layout values only — CSS transforms never affect offsetWidth or
// clientWidth, so bounds math never reads mid-animation (stale) geometry.
let fitBox = null

const imageStyle = computed(() => ({
	transform: `rotate(${rotation.value}deg) scale(${rotationFitScale.value})`,
}))

const isFitZoom = () => scale.value <= ZOOM_MIN + SCALE_EPSILON

const cursorClass = computed(() => {
	if (isFitZoom()) {
		return 'viewer-image--zoom-in'
	}
	return grabbing.value ? 'viewer-image--grabbing' : 'viewer-image--grab'
})

/**
 *
 */
function measureFitBox() {
	const image = imageRef.value
	const width = image?.offsetWidth
	const height = image?.offsetHeight
	const containerWidth = panzoomWrapperRef.value.clientWidth
	const containerHeight = panzoomWrapperRef.value.clientHeight
	if (!width || !height || !containerWidth || !containerHeight) {
		fitBox = null
		return
	}
	const rotated = (rotation.value / ROTATION_STEP) % 2 !== 0
	rotationFitScale.value = rotated
		? Math.min(1, containerWidth / height, containerHeight / width)
		: 1
	const visualWidth = (rotated ? height : width) * rotationFitScale.value
	const visualHeight = (rotated ? width : height) * rotationFitScale.value
	// The image is flex-centered in the wrapper, so its center is always the
	// container center in layout coordinates
	fitBox = {
		cx: containerWidth / 2,
		cy: containerHeight / 2,
		halfW: visualWidth / 2,
		halfH: visualHeight / 2,
	}
}

/**
 * Clamp/center the transform in place. Mutating panzoom's transform model
 * synchronously inside its event handlers applies before the pending repaint
 * and, unlike calling moveTo() from a handler, cannot re-trigger events.
 * Per axis: if the scaled image fits the container — keep it centered,
 * otherwise never let an image edge move inside the container edge.
 *
 * @param {object} transform - Panzoom transform model to adjust
 */
function applyBounds(transform) {
	if (!fitBox) {
		return
	}
	const containerWidth = panzoomWrapperRef.value.clientWidth
	const containerHeight = panzoomWrapperRef.value.clientHeight

	const halfW = fitBox.halfW * transform.scale
	const centerX = fitBox.cx * transform.scale + transform.x
	if (halfW * 2 <= containerWidth + 1) {
		transform.x = containerWidth / 2 - fitBox.cx * transform.scale
	} else if (centerX - halfW > 0) {
		transform.x -= centerX - halfW
	} else if (centerX + halfW < containerWidth) {
		transform.x += containerWidth - (centerX + halfW)
	}

	const halfH = fitBox.halfH * transform.scale
	const centerY = fitBox.cy * transform.scale + transform.y
	if (halfH * 2 <= containerHeight + 1) {
		transform.y = containerHeight / 2 - fitBox.cy * transform.scale
	} else if (centerY - halfH > 0) {
		transform.y -= centerY - halfH
	} else if (centerY + halfH < containerHeight) {
		transform.y += containerHeight - (centerY + halfH)
	}
}

/**
 *
 */
function reclamp() {
	if (!instance) {
		return
	}
	const transform = instance.getTransform()
	// moveTo triggers the 'pan' event (a single applyBounds pass) and
	// schedules a repaint of the corrected values
	instance.moveTo(transform.x, transform.y)
}

/**
 *
 */
function initPanzoom() {
	instance = panzoom(panzoomWrapperRef.value, {
		minZoom: ZOOM_MIN,
		maxZoom: ZOOM_MAX,
		// Disable inertia so the image stops exactly where bounds put it
		smoothScroll: false,
		// At fit zoom there is nothing to pan — let panzoom ignore the mousedown
		beforeMouseDown: () => isFitZoom(),
	})
	instance.on('zoom', (pz) => {
		const transform = pz.getTransform()
		applyBounds(transform)
		scale.value = transform.scale
	})
	instance.on('zoomend', (pz) => {
		const transform = pz.getTransform()
		if (transform.scale <= ZOOM_MIN + SCALE_EPSILON) {
			// The zoom-out animation settled near fit — snap to exactly ZOOM_MIN
			transform.scale = ZOOM_MIN
			scale.value = ZOOM_MIN
			reclamp()
		}
	})
	instance.on('pan', (pz) => {
		applyBounds(pz.getTransform())
	})
	instance.on('panstart', () => {
		if (isFitZoom()) {
			return
		}
		grabbing.value = true
	})
	instance.on('panend', () => {
		grabbing.value = false
	})
}

/**
 *
 */
function disposePanzoom() {
	instance?.dispose()
	instance = null
	if (panzoomWrapperRef.value) {
		panzoomWrapperRef.value.style.transform = ''
	}
	scale.value = 1
	grabbing.value = false
	fitBox = null
}

/**
 * @param {(withError?: boolean) => void} handleLoadEnd - Callback to signal load completion
 */
function onImageLoad(handleLoadEnd) {
	handleLoadEnd(false)
	measureFitBox()
	initPanzoom()
}

/**
 * @param {(withError?: boolean) => void} handleLoadEnd - Callback to signal load error
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
	const rect = event.currentTarget.getBoundingClientRect()
	const x = event.clientX - rect.left
	const y = event.clientY - rect.top
	if (isFitZoom()) {
		instance.smoothZoom(x, y, ZOOM_FACTOR)
	} else {
		// applyBounds re-centers the image on every animation frame while it
		// zooms out, and the 'zoomend' handler snaps the final scale to fit
		instance.smoothZoomAbs(x, y, ZOOM_MIN)
	}
}

/**
 * @param {number} step - Rotation step in degrees (±ROTATION_STEP)
 */
function onRotate(step) {
	rotation.value += step
	measureFitBox()
	reclamp()
}

const actions = computed(() => [
	{ key: 'rotate-left', label: t('talk_desktop', 'Rotate left'), icon: IconRotateLeft, onClick: () => onRotate(-ROTATION_STEP) },
	{ key: 'rotate-right', label: t('talk_desktop', 'Rotate right'), icon: IconRotateRight, onClick: () => onRotate(ROTATION_STEP) },
])

defineExpose({ actions })

watch(src, () => {
	disposePanzoom()
	rotation.value = 0
	rotationFitScale.value = 1
})

let resizeObserver = null

onMounted(() => {
	resizeObserver = new ResizeObserver(() => {
		measureFitBox()
		reclamp()
	})
	resizeObserver.observe(panzoomWrapperRef.value)
})

onBeforeUnmount(() => {
	resizeObserver?.disconnect()
	disposePanzoom()
})
</script>

<template>
	<ViewerHandlerMedia v-slot="{ handleLoadEnd }">
		<!-- Capture phase intercepts dblclick before panzoom's own handler (its
			built-in dblclick zoom cannot be disabled via options); stop prevents
			the parent viewer from reacting -->
		<div class="viewer-image-container" @dblclick.capture.stop.prevent="onDoubleClick">
			<div ref="panzoomWrapper" class="viewer-image-wrapper">
				<img
					:key="src"
					ref="image"
					class="viewer-image"
					:class="cursorClass"
					:style="imageStyle"
					:src="src"
					:alt="file.basename"
					draggable="false"
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
