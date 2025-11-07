<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
/**
 * TODO: add in upstream?
 */

import type { Slot } from 'vue'

import NcFormBoxButton from '@nextcloud/vue/components/NcFormBoxButton'

defineProps<{
	label?: string
	hideLabel?: boolean
}>()

defineEmits<{
	click: [event: MouseEvent]
}>()

defineSlots<{
	default?: Slot
	icon?: Slot
}>()
</script>

<template>
	<NcFormBoxButton class="form-box-split-button" :class="{ 'form-box-split-button__no-gap': hideLabel || !$slots.icon }" @click="$emit('click', $event)">
		<span :class="{ 'hidden-visually': hideLabel } ">
			<slot>
				{{ label }}
			</slot>
		</span>
		<template #icon>
			<slot name="icon">
				<span><!-- dummy icon, prevent "icon is missing" --></span>
			</slot>
		</template>
	</NcFormBoxButton>
</template>

<style scoped>
.form-box-split-button {
	flex: 0 0 fit-content;
}

.form-box-split-button__no-gap {
	gap: 0 !important;
}
</style>
