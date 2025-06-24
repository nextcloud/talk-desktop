<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { UserStatusStatusType } from '../userStatus.types.ts'

import NcButton from '@nextcloud/vue/components/NcButton'
import NcUserStatusIcon from '@nextcloud/vue/components/NcUserStatusIcon'
import { availableUserStatusStatusTypes, userStatusTranslations } from '../userStatus.utils.ts'

const status = defineModel<UserStatusStatusType>('status', { required: true })
</script>

<template>
	<div class="user-status-form-status">
		<NcButton
			v-for="option in availableUserStatusStatusTypes"
			:key="option"
			variant="tertiary"
			alignment="start"
			:pressed="option === status"
			wide
			@click="status = option">
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
