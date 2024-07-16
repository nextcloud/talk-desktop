<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup>
import { computed, ref } from 'vue'
import NcModal from '@nextcloud/vue/dist/Components/NcModal.js'
import NcActionLink from '@nextcloud/vue/dist/Components/NcActionLink.js'
import MdiOpenInNew from 'vue-material-design-icons/OpenInNew.vue'
import { generateUrl } from '@nextcloud/router'
import { translate as t } from '@nextcloud/l10n'

const noop = () => {}

const isOpen = ref(false)
const onClose = ref(noop)
const file = ref(null)

const viewComponent = computed(() => file.value && OCA.Viewer.availableHandlers.find((handler) => handler.mimes.includes(file.value.mime))?.component)

const link = computed(() => file.value && generateUrl(`/f/${file.value.fileid}`))

/**
 * Open the viewer modal
 * @param {object} options - Options
 * @param {object} options.fileInfo - File info
 * @param {Function} options.onClose - Callback called then the modal is closed
 */
function open({ fileInfo, onClose = noop } = {}) {
	onClose.value = onClose
	file.value = fileInfo
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
	<NcModal v-if="file"
		id="viewer"
		:show.sync="isOpen"
		class="viewer-modal"
		:class="{ 'viewer-modal--open': isOpen }"
		:name="file.basename"
		size="full"
		:close-button-contained="false"
		dark
		@close="close">
		<component :is="viewComponent"
			v-if="viewComponent"
			:file="file" />

		<template #actions>
			<NcActionLink :href="link">
				<template #icon>
					<MdiOpenInNew />
				</template>
				{{ t('talk_desktop', 'Open in a Web-Browser') }}
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
.viewer-modal {
	top: 50px !important;
}

.viewer-modal :deep(.modal-container) {
	background: none !important;
}
</style>
