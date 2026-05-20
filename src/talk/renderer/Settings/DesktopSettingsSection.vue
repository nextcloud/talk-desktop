<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import { t } from '@nextcloud/l10n'
import { useMediaQuery } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import NcFormBox from '@nextcloud/vue/components/NcFormBox'
import NcFormBoxSwitch from '@nextcloud/vue/components/NcFormBoxSwitch'
import NcFormGroup from '@nextcloud/vue/components/NcFormGroup'
import DesktopSettingsSectionRelaunchNote from './components/DesktopSettingsSectionRelaunchNote.vue'
import UiFormBoxAudioOutput from './components/UiFormBoxAudioOutput.vue'
import UiFormBoxSelectNative from './components/UiFormBoxSelectNative.vue'
import UiFormGroupZoom from './components/UiFormGroupZoom.vue'
import { useAppConfigStore } from './appConfig.store.ts'
import { useAppConfigValue } from './useAppConfigValue.ts'
import { useTristateToggle } from './useTristateToggle.ts'

const isLinux = window.systemInfo.isLinux

const { isRelaunchRequired } = storeToRefs(useAppConfigStore())

const launchAtStartup = useAppConfigValue('launchAtStartup')
const launchAtStartupInBackground = useAppConfigValue('launchAtStartupInBackground')

const theme = useAppConfigValue('theme')
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
const themeToggle = useTristateToggle(theme, prefersDark, ['default', 'dark', 'light'])

const highContrast = useAppConfigValue('highContrast')
const prefersHighContrast = useMediaQuery('(prefers-contrast: more)')
const highContrastToggle = useTristateToggle(highContrast, prefersHighContrast, ['default', 'enabled', 'disabled'])

const dyslexicFont = useAppConfigValue('dyslexicFont')

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
			<NcFormBoxSwitch v-if="launchAtStartup" v-model="launchAtStartupInBackground" :label="t('talk_desktop', 'Launch in background')" />
		</NcFormBox>

		<NcFormGroup :label="t('talk_desktop', 'Appearance')">
			<NcFormBox>
				<NcFormBoxSwitch
					v-model="themeToggle"
					:label="t('talk_desktop', 'Dark mode')" />
			</NcFormBox>
		</NcFormGroup>

		<NcFormGroup :label="t('talk_desktop', 'System integration')">
			<NcFormBox>
				<NcFormBoxSwitch v-model="monochromeTrayIcon" :label="t('talk_desktop', 'Use monochrome tray icon')" />
				<NcFormBoxSwitch v-model="systemTitleBar" :label="t('talk_desktop', 'Use system title bar')" />
			</NcFormBox>
		</NcFormGroup>

		<NcFormGroup :label="t('talk_desktop', 'Accessibility')">
			<NcFormBox>
				<NcFormBoxSwitch
					v-model="highContrastToggle"
					:label="t('talk_desktop', 'High contrast')" />
				<NcFormBoxSwitch
					v-model="dyslexicFont"
					:label="t('talk_desktop', 'Dyslexia font')"
					:description="t('talk_desktop', 'Use OpenDyslexic font, created to help with some symptoms of dyslexia')" />
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
