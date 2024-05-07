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
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import NcUserStatusIcon from '@nextcloud/vue/dist/Components/NcUserStatusIcon.js'
import { userStatusTranslations } from '../userStatus.utils.js'

defineProps({
	status: {
		type: String,
		required: true,
	},
})

const emit = defineEmits(['update:status'])
</script>

<template>
	<div class="user-status-form-status">
		<NcButton v-for="option in ['online', 'away', 'dnd', 'offline']"
			:key="option"
			type="tertiary"
			alignment="start"
			:pressed="option === status"
			wide
			@click="emit('update:status', option)">
			<template #icon>
				<NcUserStatusIcon :status="option" />
			</template>
			{{ userStatusTranslations[option] }}
		</NcButton>
	</div>
</template>

<style scoped lang="scss">
.user-status-form-status {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: var(--default-grid-baseline);
}
</style>
