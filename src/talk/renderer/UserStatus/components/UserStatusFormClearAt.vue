<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup>
import { computed } from 'vue'
import NcSelect from '@nextcloud/vue/dist/Components/NcSelect.js'
import { translate as t } from '@nextcloud/l10n'
import { clearAtToLabel, getTimestampForPredefinedClearAt } from '../userStatus.utils.ts'

const props = defineProps({
	clearAt: {
		type: Number,
		required: false,
		default: null,
	},
	disabled: Boolean,
})

const emit = defineEmits(['update:clearAt'])

const clearAtOptions = [{
	label: t('talk_desktop', 'Don\'t clear'),
	clearAt: null,
}, {
	label: t('talk_desktop', '30 minutes'),
	clearAt: {
		type: 'period',
		time: 1800,
	},
}, {
	label: t('talk_desktop', '1 hour'),
	clearAt: {
		type: 'period',
		time: 3600,
	},
}, {
	label: t('talk_desktop', '4 hours'),
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
}]

const clearAtAsLabel = computed(() => clearAtToLabel(props.clearAt))

const handleSelected = (option) => {
	emit('update:clearAt', getTimestampForPredefinedClearAt(option.clearAt))
}
</script>

<template>
	<div class="user-status-form-clear-at">
		<label for="user-status-form-clear-at-input">{{ t('talk_desktop', 'Clear after') }}</label>
		<NcSelect class="user-status-form-clear-at__select"
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
