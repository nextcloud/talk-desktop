<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { translate as t } from '@nextcloud/l10n'
import { computed } from 'vue'
import NcSelect from '@nextcloud/vue/components/NcSelect'
import { formatDuration } from '../../../../shared/datetime.utils.ts'
import { clearAtToLabel, getTimestampForPredefinedClearAt } from '../userStatus.utils.ts'

const clearAt = defineModel<number | null>('clearAt', { default: null })

const { disabled = false } = defineProps<{
	disabled?: boolean
}>()

const clearAtOptions = [
	{
		label: t('talk_desktop', 'Don\'t clear'),
		clearAt: null,
	}, {
		label: formatDuration(1800 * 1000), // 30 minutes
		clearAt: {
			type: 'period',
			time: 1800,
		},
	}, {
		label: formatDuration(3600 * 1000), // 1 hour
		clearAt: {
			type: 'period',
			time: 3600,
		},
	}, {
		label: formatDuration(14400 * 1000), // 4 hours
		clearAt: {
			type: 'period',
			time: 14400,
		},
	}, {
		label: t('talk_desktop', 'Today'),
		clearAt: {
			type: 'end-of',
			time: 'day',
		},
	}, {
		label: t('talk_desktop', 'This week'),
		clearAt: {
			type: 'end-of',
			time: 'week',
		},
	},
] as const

const clearAtAsLabel = computed(() => clearAtToLabel(clearAt.value))

/**
 * Handle the selected option
 *
 * @param option - selected option
 */
function handleSelected(option: typeof clearAtOptions[number]) {
	clearAt.value = getTimestampForPredefinedClearAt(option.clearAt)
}
</script>

<template>
	<div class="user-status-form-clear-at">
		<label for="user-status-form-clear-at-input">{{ t('talk_desktop', 'Clear after') }}</label>
		<NcSelect
			class="user-status-form-clear-at__select"
			label-outside
			input-id="user-status-form-clear-at-input"
			:searchable="false"
			:clearable="false"
			placement="top"
			:options="clearAtOptions"
			:model-value="{ label: clearAtAsLabel }"
			:disabled="disabled"
			@option:selected="handleSelected" />
	</div>
</template>

<style scoped lang="scss">
.user-status-form-clear-at {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: calc(var(--default-grid-baseline) * 2);
}

.user-status-form-clear-at__select {
	flex: 1 0;
	min-width: auto !important;
}
</style>
