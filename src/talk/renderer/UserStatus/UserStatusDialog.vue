<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
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
