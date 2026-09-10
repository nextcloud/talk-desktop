<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup>
import { translate as t } from '@nextcloud/l10n'
import { generateUrl } from '@nextcloud/router'
import { computed, ref } from 'vue'
import NcActionLink from '@nextcloud/vue/components/NcActionLink'
import NcModal from '@nextcloud/vue/components/NcModal'
import IconOpenInNew from 'vue-material-design-icons/OpenInNew.vue'

/**
 * Noop
 */
function noop() {}

/**
 * Noop for loadMore
 */
async function noopLoadMore() {
	return []
}

const isOpen = ref(false)
const isLoadingMore = ref(false)

// List of variables to sync with upstream openViewer call
const onClose = ref(noop)
const file = ref(null)
const list = ref([])
const loadMore = ref(noopLoadMore)
const hasMore = ref(false)

const viewComponent = computed(() => file.value && window.OCA.Viewer.availableHandlers.find((handler) => handler.mimes.includes(file.value.mime))?.component)

const link = computed(() => file.value && generateUrl(`/f/${file.value.fileid}`))

const currentIndex = computed(() => list.value.findIndex((item) => item.fileid === file.value?.fileid))
const hasPrevious = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value !== -1 && (currentIndex.value < list.value.length - 1 || hasMore.value))

/**
 * Open the viewer modal
 *
 * @param {object} options - Options
 * @param {object} options.fileInfo - File info
 * @param {object[]} [options.list] - List of files to paginate through
 * @param {() => Promise<object[]>} [options.loadMore] - Callback to fetch more files for the list
 * @param {() => void} options.onClose - Callback called then the modal is closed
 */
function open(options = {}) {
	onClose.value = options.onClose ?? noop
	file.value = options.fileInfo ?? null
	list.value = options.list?.length ? options.list : (file.value ? [file.value] : [])
	loadMore.value = options.loadMore ?? noopLoadMore
	hasMore.value = !!options.loadMore
	isOpen.value = true
}

/**
 * Close the viewer modal
 */
function close() {
	file.value = null
	list.value = []
	loadMore.value = noopLoadMore
	hasMore.value = false
	onClose.value()
	onClose.value = noop
}

/**
 * Show the previous file in the list
 */
function showPrevious() {
	if (hasPrevious.value) {
		file.value = list.value[currentIndex.value - 1]
	}
}

/**
 * Show the next file in the list, fetching more files first if needed
 */
async function showNext() {
	if (currentIndex.value === list.value.length - 1 && hasMore.value && !isLoadingMore.value) {
		isLoadingMore.value = true
		try {
			const moreFiles = await loadMore.value()
			if (moreFiles?.length) {
				list.value = [...list.value, ...moreFiles]
			} else {
				// No more files to load, stop trying
				hasMore.value = false
			}
		} catch (e) {
			console.error('Failed to load more files for the Viewer', e)
			hasMore.value = false
		} finally {
			isLoadingMore.value = false
		}
	}

	if (hasNext.value) {
		file.value = list.value[currentIndex.value + 1]
	}
}

defineExpose({
	open,
	close,
})
</script>

<template>
	<NcModal
		v-if="file"
		id="viewer"
		v-model:show="isOpen"
		class="viewer-modal"
		:class="{ 'viewer-modal--open': isOpen }"
		:name="file.basename"
		size="full"
		closeButtonOutside
		dark
		:hasPrevious
		:hasNext
		@close="close"
		@previous="showPrevious"
		@next="showNext">
		<component
			:is="viewComponent"
			v-if="viewComponent"
			:file="file" />

		<template #actions>
			<NcActionLink :href="link">
				<template #icon>
					<IconOpenInNew :size="20" />
				</template>
				{{ t('talk_desktop', 'Open in a web browser') }}
			</NcActionLink>
		</template>
	</NcModal>
</template>

<style>
.header {
	transition: background-color 250ms; /* Same as NcModal transition timing */
}

body:has(.viewer-modal--open) .header {
	background: black;
}
</style>

<style scoped>
/* By default modal container overlaps an entire page. Move it down to not overlap the title */
.viewer-modal {
	top: var(--header-height) !important;
}

.viewer-modal :deep(.modal-container) {
	background: none !important;
	height: calc(100% - var(--header-height) * 2) !important;
}

.viewer-modal :deep(.modal-container__content) {
	overflow: hidden !important;
}
</style>
