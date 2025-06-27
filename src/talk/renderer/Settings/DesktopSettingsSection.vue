<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import type { NcSelectOption } from '../composables/useNcSelectModel.ts'

import { t } from '@nextcloud/l10n'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcCheckboxRadioSwitch from '@nextcloud/vue/components/NcCheckboxRadioSwitch'
import NcNoteCard from '@nextcloud/vue/components/NcNoteCard'
import NcTextField from '@nextcloud/vue/components/NcTextField'
import IconBellRingOutline from 'vue-material-design-icons/BellRingOutline.vue'
import IconCardAccountPhoneOutline from 'vue-material-design-icons/CardAccountPhoneOutline.vue'
import IconMagnify from 'vue-material-design-icons/Magnify.vue'
import IconMinus from 'vue-material-design-icons/Minus.vue'
import IconPhoneRingOutline from 'vue-material-design-icons/PhoneRingOutline.vue'
import IconPlus from 'vue-material-design-icons/Plus.vue'
import IconRestore from 'vue-material-design-icons/Restore.vue'
import IconThemeLightDark from 'vue-material-design-icons/ThemeLightDark.vue'
import IconVolumeHigh from 'vue-material-design-icons/VolumeHigh.vue'
import SettingsFormGroup from './components/SettingsFormGroup.vue'
import SettingsSelect from './components/SettingsSelect.vue'
import SettingsSubsection from './components/SettingsSubsection.vue'
import { ZOOM_MAX, ZOOM_MIN } from '../../../constants.js'
import { useNcSelectModel } from '../composables/useNcSelectModel.ts'
import { useAppConfigStore } from './appConfig.store.ts'
import { useAppConfigValue } from './useAppConfigValue.ts'

const isLinux = window.systemInfo.isLinux

const { isRelaunchRequired } = storeToRefs(useAppConfigStore())

const launchAtStartup = useAppConfigValue('launchAtStartup')

const theme = useAppConfigValue('theme')
const themeOptions = [
	{ label: t('talk_desktop', 'System default'), value: 'default' } as const,
	{ label: t('talk_desktop', 'Light'), value: 'light' } as const,
	{ label: t('talk_desktop', 'Dark'), value: 'dark' } as const,
]
const themeOption = useNcSelectModel(theme, themeOptions)

const systemTitleBar = useAppConfigValue('systemTitleBar')
const monochromeTrayIcon = useAppConfigValue('monochromeTrayIcon')

const zoomFactorConfig = useAppConfigValue('zoomFactor')
const zoomFactor = computed({
	get: () => zoomFactorConfig.value,
	set: (value: number) => {
		zoomFactorConfig.value = isFinite(value) ? Math.min(Math.max(value, ZOOM_MIN), ZOOM_MAX) : 1
	},
})
const zoomFactorPercentage = computed({
	get: () => Math.round(zoomFactor.value * 100).toString(),
	set: (value: string) => {
		zoomFactor.value = parseFloat(value) / 100
	},
})
const ZOOM_STEP = Math.sqrt(1.2)
const ctrl = window.systemInfo.isMac ? 'Ctrl/Cmd' : 'Ctrl'
const zoomHint = t('talk_desktop', 'Zoom can be also changed by {key} or mouse wheel. Reset by {resetKey}', {
	key: `<kbd>${ctrl} + ±</kbd>`,
	resetKey: `<kbd>${ctrl} + 0</kbd>`,
}, undefined, { escape: false })

const generalNotificationOptions = [
	{ label: t('talk_desktop', 'Always'), value: 'always' } as const,
	{ label: t('talk_desktop', 'When not in "Do not disturb"'), value: 'respect-dnd' } as const,
	{ label: t('talk_desktop', 'Never'), value: 'never' } as const,
]

const playSoundChat = useAppConfigValue('playSoundChat')
const playSoundChatOption = useNcSelectModel(playSoundChat, generalNotificationOptions)

const playSoundCall = useAppConfigValue('playSoundCall')
const playSoundCallOption = useNcSelectModel(playSoundCall, generalNotificationOptions)

const enableCallbox = useAppConfigValue('enableCallbox')
const enableCallboxOption = useNcSelectModel(enableCallbox, generalNotificationOptions)

const secondarySpeaker = useAppConfigValue('secondarySpeaker')

const EMPTY_DEVICE_OPTION = { value: null, label: t('talk_desktop', 'None') }
const secondarySpeakerOptions = ref<NcSelectOption<string | null>[]>([])

const secondarySpeakerDevice = useAppConfigValue('secondarySpeakerDevice')
const secondarySpeakerDeviceOption = useNcSelectModel(secondarySpeakerDevice, secondarySpeakerOptions, EMPTY_DEVICE_OPTION)

/**
 * Enumerate available media devices (audio output) in format of NcSelectOption
 */
async function initializeDevices() {
	let stream = null
	try {
		stream = await navigator.mediaDevices.getUserMedia({ audio: true })
		const deviceOptions = (await navigator.mediaDevices.enumerateDevices() ?? [])
			.filter((device) => device.kind === 'audiooutput')
			.map((device) => ({ value: device.deviceId, label: device.label }))

		secondarySpeakerOptions.value = [EMPTY_DEVICE_OPTION, ...deviceOptions]
	} catch (error) {
		console.error('Error while requesting or initializing audio devices: ', error)
		secondarySpeakerOptions.value = [EMPTY_DEVICE_OPTION]
	} finally {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop())
		}
	}
}
initializeDevices()

/**
 * Restart the app
 */
function relaunch() {
	window.TALK_DESKTOP.relaunchWindow()
}
</script>

<template>
	<div>
		<NcNoteCard v-if="isRelaunchRequired" type="info" class="relaunch-require-note-card">
			<div class="relaunch-require-note-card__content">
				<span>{{ t('talk_desktop', 'Some changes require a relaunch to take effect') }}</span>
				<NcButton
					variant="primary"
					size="small"
					class="relaunch-require-note-card__button"
					@click="relaunch">
					{{ t('talk_desktop', 'Restart') }}
				</NcButton>
			</div>
		</NcNoteCard>

		<SettingsSubsection v-if="!isLinux" :name="t('talk_desktop', 'General')">
			<NcCheckboxRadioSwitch v-model="launchAtStartup" type="switch">
				{{ t('talk_desktop', 'Launch at startup') }}
			</NcCheckboxRadioSwitch>
		</SettingsSubsection>

		<SettingsSubsection :name="t('talk_desktop', 'Appearance')">
			<SettingsSelect v-model="themeOption" :options="themeOptions" :label="t('talk_desktop', 'Theme')">
				<template #icon="{ size }">
					<IconThemeLightDark :size="size" />
				</template>
			</SettingsSelect>

			<NcCheckboxRadioSwitch v-model="monochromeTrayIcon" type="switch">
				{{ t('talk_desktop', 'Use monochrome tray icon') }}
			</NcCheckboxRadioSwitch>

			<NcCheckboxRadioSwitch v-model="systemTitleBar" type="switch">
				{{ t('talk_desktop', 'Use system title bar') }}
			</NcCheckboxRadioSwitch>

			<SettingsFormGroup :label="t('talk_desktop', 'Zoom')">
				<template #icon="{ size }">
					<IconMagnify :size="size" />
				</template>
				<template #description>
					<!-- eslint-disable-next-line vue/no-v-html -->
					<span v-html="zoomHint" />
				</template>
				<template #default="{ inputId, descriptionId }">
					<NcButton :aria-label="t('talk_desktop', 'Zoom out')" variant="tertiary" @click="zoomFactor /= ZOOM_STEP">
						<template #icon>
							<IconMinus :size="20" />
						</template>
					</NcButton>
					<NcTextField
						:id="inputId"
						class="zoom-input"
						:aria-describedby="descriptionId"
						label-outside
						inputmode="number"
						:model-value="zoomFactorPercentage"
						@change="zoomFactorPercentage = $event.target.value"
						@blur="$event.target.value = zoomFactorPercentage" />
					<NcButton :aria-label="t('talk_desktop', 'Zoom in')" variant="tertiary" @click="zoomFactor *= ZOOM_STEP">
						<template #icon>
							<IconPlus :size="20" />
						</template>
					</NcButton>
					<NcButton @click="zoomFactor = 1">
						<template #icon>
							<IconRestore :size="20" />
						</template>
						{{ t('talk_desktop', 'Reset') }}
					</NcButton>
				</template>
			</SettingsFormGroup>
		</SettingsSubsection>

		<SettingsSubsection :name="t('talk_desktop', 'Notifications and sounds')">
			<SettingsSelect v-model="playSoundChatOption" :options="generalNotificationOptions" :label="t('talk_desktop', 'Play chat notification sound')">
				<template #icon="{ size }">
					<IconBellRingOutline :size="size" />
				</template>
			</SettingsSelect>

			<SettingsSelect v-model="playSoundCallOption" :options="generalNotificationOptions" :label="t('talk_desktop', 'Play call notification sound')">
				<template #icon="{ size }">
					<IconPhoneRingOutline :size="size" />
				</template>
			</SettingsSelect>

			<SettingsSelect v-model="enableCallboxOption" :options="generalNotificationOptions" :label="t('talk_desktop', 'Show call notification popup')">
				<template #icon="{ size }">
					<IconCardAccountPhoneOutline :size="size" />
				</template>
			</SettingsSelect>

			<NcCheckboxRadioSwitch v-model="secondarySpeaker" type="switch">
				{{ t('talk_desktop', 'Also repeat call notification on a secondary speaker') }}
			</NcCheckboxRadioSwitch>

			<SettingsSelect
				v-if="secondarySpeaker"
				v-model="secondarySpeakerDeviceOption"
				:options="secondarySpeakerOptions"
				:disabled="secondarySpeakerOptions.length === 1"
				:label="t('talk_desktop', 'Secondary speaker')">
				<template #icon="{ size }">
					<IconVolumeHigh :size="size" />
				</template>
				<template #action>
					<NcButton variant="tertiary" @click="initializeDevices">
						<template #icon>
							<IconRestore :size="20" />
						</template>
					</NcButton>
				</template>
			</SettingsSelect>
		</SettingsSubsection>
	</div>
</template>

<style scoped>
.relaunch-require-note-card {
	margin-block-start: 0 !important;
}

.relaunch-require-note-card > :deep(div) {
	flex: 1; /* TODO: fix in upstream */
}

.relaunch-require-note-card__content {
	display: flex;
	gap: var(--default-grid-baseline);
	align-items: flex-start;
}

.relaunch-require-note-card__button {
	margin-inline-start: auto;
	flex: 0 0 auto;
}

.zoom-input {
	width: 50px !important;
}
</style>
