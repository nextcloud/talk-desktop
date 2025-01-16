<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup>
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import NcUserStatusIcon from '@nextcloud/vue/dist/Components/NcUserStatusIcon.js'
import { userStatusTranslations } from '../userStatus.utils.ts'

defineProps({
	status: {
		type: String,
		required: true,
	},
})

const emit = defineEmits(['update:status'])
</script>

<template>
	<div class="user-status-form-status">
		<NcButton v-for="option in ['online', 'away', 'dnd', 'offline']"
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
