<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
defineProps<{
	label: string
	description?: string
}>()

const id = Math.random().toString(36).slice(2, 6)

const inputId = 'settings-form-group-input-' + id
const descriptionId = 'settings-form-group-description-' + id
</script>

<template>
	<div class="settings-form-group">
		<div class="settings-form-group__icon">
			<slot name="icon" :size="20" />
		</div>
		<div>
			<div class="settings-form-group__content">
				<label :for="inputId">
					{{ label }}
				</label>
				<slot :input-id="inputId" :description-id="descriptionId" />
			</div>
			<p v-if="description || $slots.description" id="descriptionId" class="settings-form-group__hint">
				<slot name="description">
					{{ description }}
				</slot>
			</p>
		</div>
		<slot name="action" />
	</div>
</template>

<style scoped>
.settings-form-group {
	display: flex;
	gap: var(--default-grid-baseline);
	padding-inline-start: calc(var(--default-grid-baseline) * 2);
}

.settings-form-group__content {
	display: flex;
	align-items: center;
	gap: var(--default-grid-baseline);
}

.settings-form-group__icon {
	display: flex;
	justify-content: center;
	width: 36px;
	height: var(--default-clickable-area);
}

.settings-form-group__hint {
	color: var(--color-text-maxcontrast);
	margin-block-start: var(--default-grid-baseline);
}
</style>
