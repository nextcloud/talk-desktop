<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { PredefinedUserStatus, UserStatusBackup } from '../userStatus.types.ts'
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import { clearAtToLabel } from '../userStatus.utils.ts'

withDefaults(defineProps<{
	userStatus: PredefinedUserStatus | UserStatusBackup,
	pressed?: boolean,
}>(), {
	pressed: false,
})

const emit = defineEmits<{
	(event: 'click'): void
}>()
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
