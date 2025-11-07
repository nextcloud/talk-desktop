<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import { t } from '@nextcloud/l10n'
import NcFormBox from '@nextcloud/vue/components/NcFormBox'
import IconReload from 'vue-material-design-icons/Reload.vue'
import UiFormBoxSelectNative from './UiFormBoxSelectNative.vue'
import UiFormBoxSplitButton from './UiFormBoxSplitButton.vue'
import { useAudioDevicesList } from './useAudioDevicesList.ts'

const modelValue = defineModel<string | null>({ required: true })

defineProps<{
	label: string
}>()

const { devices, reloadDevices } = useAudioDevicesList()
</script>

<template>
	<NcFormBox class="audio-output" row>
		<UiFormBoxSelectNative
			v-model="modelValue"
			class="audio-output__select"
			:label
			:options="devices"
			:unselected="t('talk_desktop', 'Loading …')"
			:disabled="devices.length === 1" />
		<UiFormBoxSplitButton
			class="audio-output__reset"
			:label="t('talk_desktop', 'Reload')"
			hide-label
			@click="reloadDevices">
			<template #icon>
				<IconReload :size="20" />
			</template>
		</UiFormBoxSplitButton>
	</NcFormBox>
</template>

<style scoped>
/* TODO: fix in upstream - https://github.com/nextcloud-libraries/nextcloud-vue/pull/7887 */
.audio-output {
	.audio-output__select {
		border-start-start-radius: var(--border-radius-small) !important;
		border-start-end-radius: var(--border-radius-small) !important;
		border-end-end-radius: var(--border-radius-small) !important;
	}

	.audio-output__reset {
		border-start-end-radius: var(--border-radius-small) !important;
		border-end-start-radius: var(--border-radius-small) !important;
	}
}
</style>
