<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import { t } from '@nextcloud/l10n'
import { computed, type ComputedRef, type Ref, ref, watch } from 'vue'
import NcCheckboxRadioSwitch from '@nextcloud/vue/dist/Components/NcCheckboxRadioSwitch.js'
import NcSelect from '@nextcloud/vue/dist/Components/NcSelect.js'
import SettingsSubsection from './SettingsSubsection.vue'
import IconThemeLightDark from 'vue-material-design-icons/ThemeLightDark.vue'
import IconWeatherSunny from 'vue-material-design-icons/WeatherSunny.vue'
import IconWeatherNight from 'vue-material-design-icons/WeatherNight.vue'
import IconBellOutline from 'vue-material-design-icons/BellOutline.vue'
import { applyBodyThemeAttrs } from '../../../../shared/theme.utils.js'

type Theme = 'default' | 'light' | 'dark'
type SelectOption<T> = { label: string, value: T }

// Just an example
const theme: Ref<Theme> = ref('default')
watch(theme, () => {
	applyBodyThemeAttrs(theme.value)
})
const themeOptions = [
	{ label: t('talk_desktop', 'System default'), value: 'default' },
	{ label: t('talk_desktop', 'Light'), value: 'light' },
	{ label: t('talk_desktop', 'Dark'), value: 'dark' },
] as const
const themeOption: ComputedRef<SelectOption<Theme>> = computed({
	get: () => themeOptions.find(option => option.value === theme.value),

	set: (valueOption: { label: string, value: Theme }) => {
		theme.value = valueOption.value
	},
})

const playSound = ref('no-dnd')
const playSoundOptions = [
	{ label: t('talk_desktop', 'Always'), value: 'always' },
	{ label: t('talk_desktop', 'When not in Do Not Disturb'), value: 'no-dnd' },
	{ label: t('talk_desktop', 'Never'), value: 'never' },
] as const
const playSoundOption = computed({
	get: () => playSoundOptions.find(option => option.value === playSound.value),

	set: (valueOption: { value: string }) => {
		playSound.value = valueOption.value
	},
})

const runMinimizedToTray = ref(false)
</script>

<template>
	<div>
		<SettingsSubsection :name="t('talk_desktop', 'General')">
			<NcCheckboxRadioSwitch :checked.sync="runMinimizedToTray" type="switch">
				{{ t('talk_desktop', 'Launch at startup') }}
			</NcCheckboxRadioSwitch>
			<NcCheckboxRadioSwitch :checked.sync="runMinimizedToTray" type="switch">
				{{ t('talk_desktop', 'Launch minimized to the system tray') }}
			</NcCheckboxRadioSwitch>
		</SettingsSubsection>

		<SettingsSubsection :name="t('talk_desktop', 'Appearance')">
			<label style="display: flex; gap: 8px; padding: 0 8px;">
				<span style="display: flex; align-items: center">
					<IconThemeLightDark :size="20" style="width: 36px" />
					<span>{{ t('talk_desktop', 'Theme') }}</span>
				</span>
				<NcSelect v-model="themeOption"
					:clearable="false"
					:searchable="false"
					label-outside
					style="margin: 0 !important; flex: 1 0 auto;"
					:options="themeOptions" />
			</label>

			<NcCheckboxRadioSwitch :checked.sync="runMinimizedToTray" type="switch">
				{{ t('talk_desktop', 'Use monochrome tray icon') }}
			</NcCheckboxRadioSwitch>
			<NcCheckboxRadioSwitch :checked.sync="runMinimizedToTray" type="switch">
				{{ t('talk_desktop', 'Use system title bar') }}
			</NcCheckboxRadioSwitch>
		</SettingsSubsection>

		<SettingsSubsection :name="t('talk_desktop', 'Notifications')">
			<label style="display: flex; gap: 8px; padding: 0 8px;">
				<span style="display: flex; align-items: center">
					<IconBellOutline :size="20" style="width: 36px" />
					<span>{{ t('talk_desktop', 'Notification sound') }}</span>
				</span>
				<NcSelect v-model="playSoundOption"
					:clearable="false"
					:searchable="false"
					label-outside
					style="margin: 0 !important"
					:options="playSoundOptions" />
			</label>
			<NcCheckboxRadioSwitch :checked.sync="runMinimizedToTray" type="switch">
				{{ t('talk_desktop', 'Show message text in the notification') }}
			</NcCheckboxRadioSwitch>
		</SettingsSubsection>
	</div>
</template>
