<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { UserStatusBackup } from './userStatus.types.ts'
import NcDialog from '@nextcloud/vue/components/NcDialog'
import NcLoadingIcon from '@nextcloud/vue/components/NcLoadingIcon'
import { getCurrentUser } from '@nextcloud/auth'
import { t } from '@nextcloud/l10n'
import { onBeforeMount, ref } from 'vue'
import { useUserStatusStore } from './userStatus.store.ts'
import UserStatusForm from './components/UserStatusForm.vue'
import { usePredefinedStatusesStore } from './predefinedStatuses.store.ts'
import { fetchBackupStatus } from './userStatus.service.ts'

const emit = defineEmits<{
	(event: 'close'): void
}>()

const isReady = ref(false)
const userStatusStore = useUserStatusStore()
const predefinedStatusesStore = usePredefinedStatusesStore()
const backupStatus = ref<UserStatusBackup | null>(null)

onBeforeMount(async () => {
	await Promise.all([
		predefinedStatusesStore.initPromise,
		userStatusStore.refreshUserStatus(),
		loadBackupStatus(),
	])
	isReady.value = true
})

/**
 * Load the backup status
 */
async function loadBackupStatus() {
	backupStatus.value = await fetchBackupStatus(getCurrentUser()!.uid).catch(() => null)
}
</script>

<template>
	<NcDialog :name="t('talk_desktop', 'User status')" size="small" @closing="emit('close')">
		<UserStatusForm v-if="isReady" :backup-status.sync="backupStatus" @submit="emit('close')" />
		<NcLoadingIcon v-else :size="48" style="height: 480px /* Approx. size of the form */" />
	</NcDialog>
</template>
