<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { PredefinedUserStatus, UserStatusBackup } from '../userStatus.types.ts'

import NcButton from '@nextcloud/vue/components/NcButton'
import NcUserStatusIcon from '@nextcloud/vue/components/NcUserStatusIcon'
import { clearAtToLabel } from '../userStatus.utils.ts'

const { userStatus, pressed = false } = defineProps<{
	userStatus: PredefinedUserStatus | UserStatusBackup
	pressed?: boolean
}>()

const emit = defineEmits<{
	click: []
}>()
</script>

<template>
	<NcButton
		variant="tertiary"
		alignment="start"
		wide
		:pressed="pressed"
		@click="emit('click')">
		<template #icon>
			<template v-if="userStatus.icon">
				{{ userStatus.icon }}
			</template>
			<NcUserStatusIcon v-else-if="'status' in userStatus" :status="userStatus.status" />
		</template>
		<span v-if="userStatus.message">
			{{ userStatus.message }}
		</span>
		<span class="predefined-option__clear-at">
			<span v-if="userStatus.message"> - </span>
			{{ clearAtToLabel(userStatus.clearAt) }}
		</span>
	</NcButton>
</template>

<style scoped>
.predefined-option__clear-at {
	font-weight: normal;
	color: var(--color-text-maxcontrast);
}
</style>
