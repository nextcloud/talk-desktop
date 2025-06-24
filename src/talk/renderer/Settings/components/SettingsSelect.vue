<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts" generic="T">
import type { NcSelectOption } from '../../composables/useNcSelectModel.ts'

import NcSelect from '@nextcloud/vue/components/NcSelect'
import SettingsFormGroup from './SettingsFormGroup.vue'

const model = defineModel<NcSelectOption<T>>({ required: true })

defineProps<{
	label: string
	options: NcSelectOption<T>[]
	disabled?: boolean
}>()
</script>

<template>
	<SettingsFormGroup :label="label">
		<template #icon="{ size }">
			<slot name="icon" :size="size" />
		</template>

		<template #default="{ inputId }">
			<NcSelect
				v-model="model"
				class="settings-select"
				:options="options"
				:disabled="disabled"
				:clearable="false"
				:searchable="false"
				:input-id="inputId"
				label-outside />
		</template>

		<template #action>
			<slot name="action" />
		</template>
	</SettingsFormGroup>
</template>

<style scoped>
.settings-select {
	/* TODO: fix in upstream? */
	margin: 0 !important;
}
</style>
