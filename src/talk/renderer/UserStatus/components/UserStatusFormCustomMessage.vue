<!--
  - @copyright Copyright (c) 2024 Grigorii Shartsev <me@shgk.me>
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

<script setup>
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import NcEmojiPicker from '@nextcloud/vue/dist/Components/NcEmojiPicker.js'
import NcTextField from '@nextcloud/vue/dist/Components/NcTextField.js'
import { translate as t } from '@nextcloud/l10n'
import MdiEmoticonOutline from 'vue-material-design-icons/EmoticonOutline.vue'

defineProps({
	icon: {
		type: [String, null],
		required: false,
		default: null,
	},
	message: {
		type: [String, null],
		required: false,
		default: null,
	},
	disabled: Boolean,
})

const emit = defineEmits(['update:icon', 'update:message'])

const handleUserStatusEmojiChange = (icon) => {
	emit('update:icon', icon)
}

const handleUserStatusMessageChange = (message) => {
	emit('update:message', message)
}
</script>

<template>
	<div class="user-status-form-custom-message">
		<NcEmojiPicker @select="handleUserStatusEmojiChange">
			<NcButton :aria-label="t('talk_desktop', 'Emoji for your status message')" type="tertiary" :disabled="disabled">
				<template #icon>
					<template v-if="icon">
						{{ icon }}
					</template>
					<MdiEmoticonOutline v-else :size="20" />
				</template>
			</NcButton>
		</NcEmojiPicker>

		<NcTextField :label="t('talk_desktop', 'Status message')"
			maxlength="80"
			:disabled="disabled"
			:value="message ?? ''"
			@update:value="handleUserStatusMessageChange" />
	</div>
</template>

<style scoped lang="scss">
.user-status-form-custom-message {
	display: flex;
	flex-direction: row;
	align-items: flex-end;
	gap: var(--default-grid-baseline);
}
</style>
