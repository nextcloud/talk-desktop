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

const isOpen = ref(false)
const onClose = ref(noop)
const file = ref(null)

const viewComponent = computed(() => file.value && window.OCA.Viewer.availableHandlers.find((handler) => handler.mimes.includes(file.value.mime))?.component)

const link = computed(() => file.value && generateUrl(`/f/${file.value.fileid}`))

/**
 * Open the viewer modal
 *
 * @param {object} options - Options
 * @param {object} options.fileInfo - File info
 * @param {Function} options.onClose - Callback called then the modal is closed
 */
function open(options = {}) {
	onClose.value = options.onClose ?? noop
	file.value = options.fileInfo ?? null
	isOpen.value = true
}

/**
 * Close the viewer modal
 */
function close() {
	file.value = null
	onClose.value()
	onClose.value = noop
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
		close-button-outside
		dark
		@close="close">
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
