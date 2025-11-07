<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts" generic="T extends string | number | null">
/**
 * See: https://github.com/nextcloud-libraries/nextcloud-vue/pull/7838
 */

import { computed, useId, useTemplateRef } from 'vue'
import IconUnfoldMoreHorizontal from 'vue-material-design-icons/UnfoldMoreHorizontal.vue'
import NcFormBoxItem from './NcFormBoxItem.vue'

/** Selected value */
const modelValue = defineModel<T>({ required: true })

const {
	label = undefined,
	options,
	unselected = '',
	disabled = false,
} = defineProps<{
	/** Main label */
	label?: string
	/** Select options */
	options: {
		label: string
		value: T
	}[]
	unselected?: string
	/** Disabled state */
	disabled?: boolean
}>()

const selectId = useId()
const selectElement = useTemplateRef('select')
const selectedLabel = computed(() => options.find((option) => option.value === modelValue.value)?.label || unselected)
</script>

<template>
	<NcFormBoxItem
		tag="label"
		:for="selectId"
		:label
		:description="selectedLabel"
		:disabled
		inverted-accent
		@click="selectElement!.showPicker()">
		<template #icon="{ descriptionId }">
			<IconUnfoldMoreHorizontal :size="20" />
			<select
				:id="selectId"
				ref="select"
				v-model="modelValue"
				class="hidden-select"
				:aria-describedby="descriptionId">
				<option v-for="option in options" :key="option.value || ''" :value="option.value">
					{{ option.label }}
				</option>
			</select>
		</template>
	</NcFormBoxItem>
</template>

<style scoped>
.hidden-select {
	position: absolute;
	inset: 0;
	margin: 0;
	height: auto;
	opacity: 0;
	pointer-events: none;

	option {
		pointer-events: all;
	}
}
</style>
