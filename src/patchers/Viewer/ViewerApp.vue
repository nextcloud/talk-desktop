<!--
  - @copyright Copyright (c) 2023 Grigorii Shartsev <me@shgk.me>
  -
  - @author Grigorii Shartsev <me@shgk.me>
  -
  - @license AGPL-3.0-or-later
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -->

<template>
	<NcModal v-if="file"
		:show.sync="isOpen"
		class="viewer-modal"
		:title="file.basename"
		size="full"
		:close-button-contained="false"
		dark>
		<component :is="viewComponent"
			v-if="viewComponent"
			:file="file" />
	</NcModal>
</template>

<script>
import NcModal from '@nextcloud/vue/dist/Components/NcModal.js'
import ViewerHandlerImage from './ViewerHandlerImage.vue'

const noop = () => {}

export default {
	name: 'ViewerApp',

	components: {
		NcModal,
		ViewerHandlerImage,
	},

	data() {
		return {
			isOpen: false,
			onClose: noop,
			file: null,
		}
	},

	computed: {
		viewComponent() {
			return this.file && OCA.Viewer.availableHandlers.find(handler => handler.mimes.includes(this.file.mime))?.component
		},
	},

	methods: {
		open({ path, list, onClose = noop } = {}) {
			this.onClose = onClose
			this.file = list[0]
			this.isOpen = true
		},

		close() {
			if (!this.isOpen) {
				return
			}

			this.file = null

			this.onClose()
			this.onClose = noop
		},
	},
}
</script>

<style scoped>
.viewer-modal :deep(.modal-container) {
	background: none !important;
}
</style>
