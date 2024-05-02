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
import NcDialog from '@nextcloud/vue/dist/Components/NcDialog.js'
import { translate as t } from '@nextcloud/l10n'
import { useUserStatusStore } from './userStatus.store.js'
import UserStatusForm from './components/UserStatusForm.vue'

const emit = defineEmits(['close'])

const userStatusStore = useUserStatusStore()
</script>

<template>
	<NcDialog :name="t('talk_desktop', 'User status')" size="small" @closing="emit('close')">
		<UserStatusForm v-if="userStatusStore.userStatus" @submit="emit('close')" />
	</NcDialog>
</template>
