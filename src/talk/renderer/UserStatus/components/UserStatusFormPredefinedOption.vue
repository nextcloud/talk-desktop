<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup>
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import { clearAtToLabel } from '../userStatus.utils.ts'

defineProps({
	userStatus: {
		type: Object,
		required: true,
	},
	pressed: Boolean,
})

const emit = defineEmits(['click'])
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
