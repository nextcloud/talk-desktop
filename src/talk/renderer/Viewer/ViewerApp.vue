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

<script>
import NcModal from '@nextcloud/vue/dist/Components/NcModal.js'
import NcActionLink from '@nextcloud/vue/dist/Components/NcActionLink.js'
import MdiOpenInNew from 'vue-material-design-icons/OpenInNew.vue'

import { generateUrl } from '@nextcloud/router'
import { translate as t } from '@nextcloud/l10n'

const noop = () => {}

export default {
	name: 'ViewerApp',

	components: {
		MdiOpenInNew,
		NcModal,
		NcActionLink,
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
			return this.file && OCA.Viewer.availableHandlers.find((handler) => handler.mimes.includes(this.file.mime))?.component
		},

		link() {
			return this.file && generateUrl(`/f/${this.file.fileid}`)
		},
	},

	methods: {
		t,

		open({ fileInfo, onClose = noop } = {}) {
			this.onClose = onClose
			this.file = fileInfo
			this.isOpen = true
		},

		close() {
			this.file = null

			this.onClose()
			this.onClose = noop
		},
	},
}
</script>

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
