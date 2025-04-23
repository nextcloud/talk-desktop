<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import NcDialog from '@nextcloud/vue/components/NcDialog'
import NcLoadingIcon from '@nextcloud/vue/components/NcLoadingIcon'
import { translate as t } from '@nextcloud/l10n'
import { onBeforeMount, ref } from 'vue'
import { useUserStatusStore } from './userStatus.store.ts'
import UserStatusForm from './components/UserStatusForm.vue'
import { usePredefinedStatusesStore } from './predefinedStatuses.store.ts'

const emit = defineEmits<{
	(event: 'close'): void
}>()

const isReady = ref(false)
const userStatusStore = useUserStatusStore()
const predefinedStatusesStore = usePredefinedStatusesStore()

onBeforeMount(async () => {
	await Promise.all([
		predefinedStatusesStore.initPromise,
		userStatusStore.refreshUserStatus(),
	])
	isReady.value = true
})
</script>

<template>
	<NcDialog :name="t('talk_desktop', 'User status')" size="small" @closing="emit('close')">
		<UserStatusForm v-if="isReady" @submit="emit('close')" />
		<NcLoadingIcon v-else :size="48" style="height: 480px /* Approx. size of the form */" />
	</NcDialog>
</template>
