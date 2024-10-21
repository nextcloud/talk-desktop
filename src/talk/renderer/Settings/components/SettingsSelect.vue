<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import { computed } from 'vue'
import NcSelect from '@nextcloud/vue/dist/Components/NcSelect.js'
import type { NcSelectOption } from '../../composables/useNcSelectModel.ts'

const props = defineProps<{
	options: NcSelectOption<unknown>[]
	modelValue: NcSelectOption<unknown>
}>()

const emit = defineEmits<{
	(event: 'update:modelValue', value: NcSelectOption<unknown>): void
}>()

const model = computed({
	get: () => props.modelValue,
	set: (value: NcSelectOption<unknown>) => emit('update:modelValue', value),
})
</script>

<script lang="ts">
export default {
	model: {
		prop: 'modelValue',
		event: 'update:modelValue',
	},
}
</script>

<template>
	<label class="settings-select">
		<span class="settings-select__label">
			<span v-if="$slots.icon" class="settings-select__label-icon">
				<slot name="icon" />
			</span>
			<span>
				<slot />
			</span>
		</span>
		<NcSelect v-model="model"
			class="settings-select__select"
			:options="options"
			:clearable="false"
			:searchable="false"
			label-outside />
	</label>
</template>

<style scoped>
.settings-select {
	--icon-height: 16px;
	--icon-width: 36px;
	display: flex;
	gap: calc(var(--default-grid-baseline) * 2);
	padding: 0 var(--default-grid-baseline) 0 calc((var(--default-clickable-area) - var(--icon-height)) / 2);
}

.settings-select__label {
	display: flex;
	align-items: center;
	gap: var(--default-grid-baseline);
}

.settings-select__label-icon {
	width: var(--icon-width);
}

.settings-select__select {
	/* TODO: fix in upstream? */
	margin: 0 !important;
}
</style>
