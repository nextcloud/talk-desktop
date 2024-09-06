<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup>
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import NcEmojiPicker from '@nextcloud/vue/dist/Components/NcEmojiPicker.js'
import NcTextField from '@nextcloud/vue/dist/Components/NcTextField.js'
import { translate as t } from '@nextcloud/l10n'
import IconEmoticonOutline from 'vue-material-design-icons/EmoticonOutline.vue'

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
					<IconEmoticonOutline v-else :size="20" />
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
