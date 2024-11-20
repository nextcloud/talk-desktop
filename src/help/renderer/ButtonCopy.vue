<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script lang="ts">
export default {
	inheritAttrs: false,
}
</script>

<script setup lang="ts">
/* eslint-disable import/first */
import { ref } from 'vue'
import IconCheck from 'vue-material-design-icons/Check.vue'
import IconCopy from 'vue-material-design-icons/ContentCopy.vue'
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import { t } from '@nextcloud/l10n'

const props = withDefaults(
	defineProps<{
  text?: string,
  content?: string,
  getContent?: () => string,
}>(), {
		text: t('talk_desktop', 'Copy'),
		content: undefined,
		getContent: undefined,
	})

const DELAY = 2000

const copied = ref(false)

/**
 * Copy the content to the clipboard
 */
async function copy() {
	if (copied.value) {
		return
	}

	try {
		const content = props.getContent?.() || props.content
		if (!content) {
			console.warn('No content to copy')
			return
		}
		await navigator.clipboard.writeText(content)

		copied.value = true
		setTimeout(() => {
			copied.value = false
		}, DELAY)
	} catch (error) {
		console.error('Failed to copy to clipboard', error)
	}
}
</script>

<template>
	<NcButton v-bind="$attrs" @click="copy">
		<template #icon>
			<IconCheck v-if="copied" />
			<slot v-else name="icon" :size="20">
				<IconCopy :size="20" />
			</slot>
		</template>

		<span class="copy-button__content">
			<span :class="{ 'copy-button__text-hidden': copied }">
				<slot>
					{{ text }}
				</slot>
			</span>
			<span :class="{ 'copy-button__text-hidden': !copied }">
				{{ t('talk_desktop', 'Copied') }}
			</span>
		</span>
	</NcButton>
</template>

<style scoped>
.copy-button__content {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}

.copy-button__text-hidden {
	height: 0;
	overflow: hidden;
}
</style>
