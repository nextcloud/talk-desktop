<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import { t } from '@nextcloud/l10n'
import { computed, ref } from 'vue'
import NcButton from '@nextcloud/vue/components/NcButton'
import IconCheck from 'vue-material-design-icons/Check.vue'
import IconCopy from 'vue-material-design-icons/ContentCopy.vue'

type NcButtonProps = InstanceType<typeof NcButton>['$props']

const {
	label = t('talk_desktop', 'Copy'),
	labelHidden = false,
	content = undefined,
	getContent = undefined,
	variant = undefined,
} = defineProps<{
	label?: string
	labelHidden?: boolean
	content?: string
	getContent?: () => string
	variant?: NcButtonProps['variant']
}>()

const DELAY = 2000

const copied = ref(false)

const ariaLabel = computed(() => !copied.value ? label : t('talk_desktop', 'Copied'))

// TODO: either add toasts or announce status with a shared role="status" region

/**
 * Copy the content to the clipboard
 */
async function copy() {
	if (copied.value) {
		return
	}

	try {
		const contentToCopy = getContent?.() || content
		if (!contentToCopy) {
			console.warn('No content to copy')
			return
		}
		await navigator.clipboard.writeText(contentToCopy)

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
	<NcButton
		:aria-label="labelHidden ? ariaLabel : undefined"
		:title="labelHidden ? ariaLabel : undefined"
		:variant
		@click="copy">
		<template #icon>
			<IconCheck v-if="copied" :size="20" />
			<IconCopy v-else :size="20" />
		</template>

		<template v-if="!labelHidden" #default>
			<span class="copy-button__content">
				<span :class="{ 'copy-button__text-hidden': copied }" :aria-hidden="copied">
					{{ label }}
				</span>
				<span :class="{ 'copy-button__text-hidden': !copied }" :aria-hidden="!copied">
					{{ t('talk_desktop', 'Copied') }}
				</span>
			</span>
		</template>
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
