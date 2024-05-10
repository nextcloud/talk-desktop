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
import { translate as t } from '@nextcloud/l10n'
import NcSelect from '@nextcloud/vue/dist/Components/NcSelect.js'
import NcUserStatusIcon from '@nextcloud/vue/dist/Components/NcUserStatusIcon.js'
import { userStatusTranslations } from '../userStatus.utils.js'

const props = defineProps({
	status: {
		type: String,
		required: true,
	},
})

const emit = defineEmits(['update:status'])

const options = [
	{
		value: 'online',
		label: userStatusTranslations.online,
	},
	{
		value: 'away',
		label: userStatusTranslations.away,
	},
	{
		value: 'dnd',
		label: userStatusTranslations.dnd,
	},
	{
		value: 'offline',
		label: userStatusTranslations.offline,
	},
]

const selectedOption = computed(() => options.find((option) => option.value === props.status))
</script>

<template>
	<div class="user-status-form-status">
		<NcSelect class="user-status__select"
			:aria-label-compobox="t('talk_desktop', 'Online status')"
			:append-to-body="false"
			:clearable="false"
			:searchable="false"
			:options="options"
			:value="selectedOption"
			@input="emit('update:status', $event.value)">
			<template #selected-option="option">
				<div class="user-status-select__option">
					<NcUserStatusIcon :status="option.value" :size="20" />
					<span>{{ option.label }}</span>
				</div>
			</template>
			<template #option="option">
				<div class="user-status-select__option">
					<NcUserStatusIcon :status="option.value" :size="20" />
					<span>{{ option.label }}</span>
				</div>
			</template>
		</NcSelect>
	</div>
</template>

<style scoped lang="scss">
.user-status-form-status {
	height: var(--default-clickable-area);
}

.user-status__select {
	width: 100%;
	--vs-border-color: transparent;
}

.user-status-select__option {
	display: flex;
	gap: calc(2 * var(--default-grid-baseline));
	align-items: center;
}
</style>
