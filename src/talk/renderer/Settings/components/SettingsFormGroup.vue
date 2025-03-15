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
		<div class="settings-form-group__inner">
			<div class="settings-form-group__content">
				<label class="settings-form-group__label" :for="inputId">
					{{ label }}
				</label>
				<span class="settings-form-group__divider" />
				<div class="settings-form-group__input">
					<slot :input-id="inputId" :description-id="descriptionId" />
				</div>
			</div>
			<p v-if="description || $slots.description" :id="descriptionId" class="settings-form-group__hint">
				<slot name="description">
					{{ description }}
				</slot>
			</p>
			<div v-if="$slots.subform">
				<slot name="subform" />
			</div>
		</div>
	</div>
</template>

<style scoped>
.settings-form-group {
	display: flex;
	gap: var(--default-grid-baseline);
	margin-block: calc(3 * var(--default-grid-baseline));
}

.settings-form-group + .settings-form-group {
	border-block-start: 1px solid var(--color-border);
	padding-block-start: calc(3 * var(--default-grid-baseline));
}

.settings-form-group__icon {
	display: flex;
	justify-content: center;
	width: var(--default-clickable-area);
	height: var(--default-clickable-area);
}

.settings-form-group__inner {
	display: flex;
	flex-direction: column;
	gap: calc(3 * var(--default-grid-baseline));
	flex: 1 1 auto;
}

.settings-form-group__content {
	display: flex;
	align-items: center;
	gap: var(--default-grid-baseline);
}

.settings-form-group__label {
	flex: 1;
}

.settings-form-group__input {
	max-width: 300px;
}

.settings-form-group__hint {
	color: var(--color-text-maxcontrast);
}
</style>
