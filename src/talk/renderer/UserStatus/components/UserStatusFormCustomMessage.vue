<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { translate as t } from '@nextcloud/l10n'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcEmojiPicker from '@nextcloud/vue/components/NcEmojiPicker'
import NcTextField from '@nextcloud/vue/components/NcTextField'
import IconEmoticonOutline from 'vue-material-design-icons/EmoticonOutline.vue'

const icon = defineModel<string | null>('icon', { default: null })
const message = defineModel<string | null>('message', { default: null })

const { disabled = false } = defineProps<{
	disabled?: boolean
}>()

</script>

<template>
	<div class="user-status-form-custom-message">
		<NcEmojiPicker @select="icon = $event">
			<NcButton :aria-label="t('talk_desktop', 'Emoji for your status message')" variant="tertiary" :disabled="disabled">
				<template #icon>
					<template v-if="icon">
						{{ icon }}
					</template>
					<IconEmoticonOutline v-else :size="20" />
				</template>
			</NcButton>
		</NcEmojiPicker>

		<NcTextField
			:label="t('talk_desktop', 'Status message')"
			maxlength="80"
			:disabled="disabled"
			:model-value="message ?? ''"
			@update:model-value="message = $event" />
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
