<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import NcButton from '@nextcloud/vue/components/NcButton'
import NcEmojiPicker from '@nextcloud/vue/components/NcEmojiPicker'
import NcTextField from '@nextcloud/vue/components/NcTextField'
import { translate as t } from '@nextcloud/l10n'
import IconEmoticonOutline from 'vue-material-design-icons/EmoticonOutline.vue'

withDefaults(defineProps<{
	icon?: string | null,
	message?: string | null,
	disabled?: boolean,
}>(), {
	icon: null,
	message: null,
	disabled: false,
})

const emit = defineEmits<{
	(event: 'update:icon', value: string | null): void,
	(event: 'update:message', value: string | null): void,
}>()

// TODO: Vue 3 - replace with `useId`
const id = Math.random().toString(36).slice(2, 8)
</script>

<template>
	<div :id="id" class="user-status-form-custom-message">
		<NcEmojiPicker :container="'#' + id" @select="emit('update:icon', $event)">
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
			:model-value="message ?? ''"
			@update:model-value="emit('update:message', $event)" />
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
