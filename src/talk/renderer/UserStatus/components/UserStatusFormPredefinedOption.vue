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
import { clearAtToLabel } from '../userStatus.utils.js'

defineProps({
	userStatus: {
		type: Object,
		required: true,
	},
	pressed: Boolean,
})

const emit = defineEmits(['click'])
</script>

<template>
	<NcButton type="tertiary"
		alignment="start"
		wide
		:pressed="pressed"
		@click="emit('click')">
		<template #icon>
			{{ userStatus.icon }}
		</template>
		{{ userStatus.message }} – {{ clearAtToLabel(userStatus.clearAt) }}
	</NcButton>
</template>
