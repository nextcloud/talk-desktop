<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import { t } from '@nextcloud/l10n'
import { storeToRefs } from 'pinia'
import NcFormBox from '@nextcloud/vue/components/NcFormBox'
import NcFormBoxSwitch from '@nextcloud/vue/components/NcFormBoxSwitch'
import NcFormGroup from '@nextcloud/vue/components/NcFormGroup'
import NcRadioGroup from '@nextcloud/vue/components/NcRadioGroup'
import NcRadioGroupButton from '@nextcloud/vue/components/NcRadioGroupButton'
import IconThemeLightDark from 'vue-material-design-icons/ThemeLightDark.vue'
import IconWeatherNight from 'vue-material-design-icons/WeatherNight.vue'
import IconWeatherSunny from 'vue-material-design-icons/WeatherSunny.vue'
import DesktopSettingsSectionRelaunchNote from './components/DesktopSettingsSectionRelaunchNote.vue'
import UiFormBoxAudioOutput from './components/UiFormBoxAudioOutput.vue'
import UiFormBoxSelectNative from './components/UiFormBoxSelectNative.vue'
import UiFormGroupZoom from './components/UiFormGroupZoom.vue'
import { useAppConfigStore } from './appConfig.store.ts'
import { useAppConfigValue } from './useAppConfigValue.ts'

const isLinux = window.systemInfo.isLinux

const { isRelaunchRequired } = storeToRefs(useAppConfigStore())

const launchAtStartup = useAppConfigValue('launchAtStartup')
const theme = useAppConfigValue('theme')
const systemTitleBar = useAppConfigValue('systemTitleBar')
const monochromeTrayIcon = useAppConfigValue('monochromeTrayIcon')
const zoomFactor = useAppConfigValue('zoomFactor')

const playSoundChat = useAppConfigValue('playSoundChat')
const playSoundCall = useAppConfigValue('playSoundCall')
const enableCallbox = useAppConfigValue('enableCallbox')
const notificationLevelOptions = [
	{ label: t('talk_desktop', 'Always'), value: 'always' },
	{ label: t('talk_desktop', 'When not in "Do not disturb"'), value: 'respect-dnd' },
	{ label: t('talk_desktop', 'Never'), value: 'never' },
]

const secondarySpeaker = useAppConfigValue('secondarySpeaker')
const secondarySpeakerDevice = useAppConfigValue('secondarySpeakerDevice')
</script>

<template>
	<div class="desktop-settings-section">
		<DesktopSettingsSectionRelaunchNote v-if="isRelaunchRequired" />

		<NcFormBox v-if="!isLinux">
			<NcFormBoxSwitch v-model="launchAtStartup" :label="t('talk_desktop', 'Launch at startup')" />
		</NcFormBox>

		<NcRadioGroup v-model="theme" :label="t('talk_desktop', 'Theme')">
			<NcRadioGroupButton :label="t('talk_desktop', 'System default')" value="default">
				<template #icon>
					<IconThemeLightDark :size="20" />
				</template>
			</NcRadioGroupButton>
			<NcRadioGroupButton :label="t('talk_desktop', 'Light')" value="light">
				<template #icon>
					<IconWeatherSunny :size="20" />
				</template>
			</NcRadioGroupButton>
			<NcRadioGroupButton :label="t('talk_desktop', 'Dark')" value="dark">
				<template #icon>
					<IconWeatherNight :size="20" />
				</template>
			</NcRadioGroupButton>
		</NcRadioGroup>

		<NcFormGroup :label="t('talk_desktop', 'Appearance')">
			<NcFormBox>
				<NcFormBoxSwitch v-model="monochromeTrayIcon" :label="t('talk_desktop', 'Use monochrome tray icon')" />
				<NcFormBoxSwitch v-model="systemTitleBar" :label="t('talk_desktop', 'Use system title bar')" />
			</NcFormBox>
		</NcFormGroup>

		<UiFormGroupZoom v-model="zoomFactor" />

		<NcFormGroup :label="t('talk_desktop', 'Notifications & Sounds')">
			<NcFormBox>
				<UiFormBoxSelectNative v-model="playSoundChat" :label="t('talk_desktop', 'Play chat notification sound')" :options="notificationLevelOptions" />
				<UiFormBoxSelectNative v-model="playSoundCall" :label="t('talk_desktop', 'Play call notification sound')" :options="notificationLevelOptions" />
				<UiFormBoxSelectNative v-model="enableCallbox" :label="t('talk_desktop', 'Show call notification popup')" :options="notificationLevelOptions" />
			</NcFormBox>

			<NcFormBox>
				<NcFormBoxSwitch v-model="secondarySpeaker" :label="t('talk_desktop', 'Also repeat call notification on a secondary speaker')" />
				<UiFormBoxAudioOutput v-if="secondarySpeaker" v-model="secondarySpeakerDevice" :label="t('talk_desktop', 'Secondary speaker')" />
			</NcFormBox>
		</NcFormGroup>
	</div>
</template>

<style scoped>
.desktop-settings-section {
	display: flex;
	flex-direction: column;
	justify-content: stretch;
	gap: calc(6 * var(--default-grid-baseline));
}
</style>
