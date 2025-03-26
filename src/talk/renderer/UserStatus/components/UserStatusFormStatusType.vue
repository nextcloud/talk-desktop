<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import NcButton from '@nextcloud/vue/components/NcButton'
import NcUserStatusIcon from '@nextcloud/vue/components/NcUserStatusIcon'
import { availableUserStatusStatusTypes, userStatusTranslations } from '../userStatus.utils.ts'
import type { UserStatusStatusType } from '../userStatus.types.ts'

defineProps<{
	status: UserStatusStatusType
}>()

const emit = defineEmits<{
	(event: 'update:status', value: UserStatusStatusType): void
}>()
</script>

<template>
	<div class="user-status-form-status">
		<NcButton
			v-for="option in availableUserStatusStatusTypes"
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
