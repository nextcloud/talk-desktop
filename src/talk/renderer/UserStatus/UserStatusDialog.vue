<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import NcDialog from '@nextcloud/vue/components/NcDialog'
import { translate as t } from '@nextcloud/l10n'
import { useUserStatusStore } from './userStatus.store.ts'
import UserStatusForm from './components/UserStatusForm.vue'

const emit = defineEmits<{
	(event: 'close'): void
}>()

const userStatusStore = useUserStatusStore()
</script>

<template>
	<NcDialog :name="t('talk_desktop', 'User status')" size="small" @closing="emit('close')">
		<UserStatusForm v-if="userStatusStore.userStatus" @submit="emit('close')" />
	</NcDialog>
</template>
