<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import { t } from '@nextcloud/l10n'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcFormBox from '@nextcloud/vue/components/NcFormBox'
import IconRestore from 'vue-material-design-icons/Restore.vue'
import UiFormBoxSelectNative from './UiFormBoxSelectNative.vue'
import { useAudioDevicesList } from './useAudioDevicesList.ts'

const modelValue = defineModel<string | null>({ required: true })

defineProps<{
	label: string
}>()

const { devices, reloadDevices } = useAudioDevicesList()
</script>

<template>
	<NcFormBox v-slot="{ itemClass }" row>
		<UiFormBoxSelectNative
			v-model="modelValue"
			:label
			:options="devices"
			:disabled="devices.length === 1" />
		<NcButton
			:aria-label="t('talk_desktop', 'Reload')"
			:title="t('talk_desktop', 'Reload')"
			variant="secondary"
			class="button--primary-light shrink"
			:class="itemClass"
			@click="reloadDevices">
			<template #icon>
				<IconRestore :size="20" />
			</template>
		</NcButton>
	</NcFormBox>
</template>

<style scoped>
.button--primary-light {
	--color-primary-element-extra-light: hsl(from var(--color-primary-element-light) h s calc(l * 1.045));
	--color-primary-element-extra-light-hover: hsl(from var(--color-primary-element-light-hover) h s calc(l * 1.045));
	background-color: var(--color-primary-element-extra-light);
	border-color: var(--color-primary-element-extra-light-hover);
	color: var(--color-primary-element-light-text);

	&:hover:not(:disabled) {
		color: var(--color-primary-element-light-text);
		background-color: var(--color-primary-element-extra-light-hover);
	}
}

.shrink {
	flex: 0 1 auto;
}
</style>
