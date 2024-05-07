<!--
  - @copyright Copyright (c) 2024 Grigorii Shartsev <me@shgk.me>
  -
  - @author Grigorii Shartsev <me@shgk.me>
  -
  - @license AGPL-3.0-or-later
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -->

<script setup>
import { computed } from 'vue'
import NcSelect from '@nextcloud/vue/dist/Components/NcSelect.js'
import { translate as t } from '@nextcloud/l10n'
import { clearAtToLabel, getTimestampForPredefinedClearAt } from '../userStatus.utils.js'

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
			:value="{ label: clearAtAsLabel }"
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
