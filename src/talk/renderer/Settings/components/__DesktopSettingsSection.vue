<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import type { Ref } from 'vue'
import { ref } from 'vue'
import { t } from '@nextcloud/l10n'
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import NcCheckboxRadioSwitch from '@nextcloud/vue/dist/Components/NcCheckboxRadioSwitch.js'
import NcNoteCard from '@nextcloud/vue/dist/Components/NcNoteCard.js'
import IconThemeLightDark from 'vue-material-design-icons/ThemeLightDark.vue'
import IconBellOutline from 'vue-material-design-icons/BellOutline.vue'
import SettingsSubsection from './SettingsSubsection.vue'
import SettingsSelect from './SettingsSelect.vue'
import { useAppConfig, useAppConfigValue } from '../useAppConfigValue.ts'
import { useNcSelectModel } from '../../composables/useNcSelectModel.ts'

const { isRelaunchRequired } = useAppConfig()

const theme = useAppConfigValue('theme')
const themeOptions = [
	{ label: t('talk_desktop', 'System default'), value: 'default' } as const,
	{ label: t('talk_desktop', 'Light'), value: 'light' } as const,
	{ label: t('talk_desktop', 'Dark'), value: 'dark' } as const,
]
const themeOption = useNcSelectModel(theme, themeOptions)

const playSound = useAppConfigValue('playSound')
const playSoundOptions = [
	{ label: t('talk_desktop', 'Always'), value: 'always' } as const,
	{ label: t('talk_desktop', 'When not in Do Not Disturb'), value: 'respect-dnd' } as const,
	{ label: t('talk_desktop', 'Never'), value: 'never' } as const,
]
const playSoundOption = useNcSelectModel(playSound, playSoundOptions)

const runOnStartup = useAppConfigValue('runOnStartup')
const systemTitleBar = useAppConfigValue('systemTitleBar')
const monochromeTrayIcon = useAppConfigValue('monochromeTrayIcon')
const scale = useAppConfigValue('scale')
const spellCheckLanguages = useAppConfigValue('spellCheckLanguages')
const showMessagePreviewInNotifications = useAppConfigValue('showMessagePreviewInNotifications')

const availableSpellCheckLanguages: Ref<string[]> = ref([])
window.TALK_DESKTOP.getAvailableSpellCheckerLanguages().then((languages: string[]) => {
	availableSpellCheckLanguages.value = languages
	console.log('availableSpellCheckLanguages', languages)
})

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
				<span>{{ t('talk_desktop', 'Some changes require a relaunch to take effect.') }}</span>
				<NcButton type="primary"
					size="small"
					class="relaunch-require-note-card__button"
					@click="relaunch">
					{{ t('talk_desktop', 'Restart') }}
				</NcButton>
			</div>
		</NcNoteCard>

		<SettingsSubsection :name="t('talk_desktop', 'General')">
			<NcCheckboxRadioSwitch :checked.sync="runOnStartup" type="switch">
				{{ t('talk_desktop', 'Launch at startup') }}
			</NcCheckboxRadioSwitch>
		</SettingsSubsection>

		<SettingsSubsection :name="t('talk_desktop', 'Appearance')">
			<SettingsSelect v-model="themeOption" :options="themeOptions">
				<template #icon>
					<IconThemeLightDark :size="20" />
				</template>
				{{ t('talk_desktop', 'Theme') }}
			</SettingsSelect>

			<NcCheckboxRadioSwitch :checked.sync="monochromeTrayIcon" type="switch">
				{{ t('talk_desktop', 'Use monochrome tray icon') }}
			</NcCheckboxRadioSwitch>

			<NcCheckboxRadioSwitch :checked.sync="systemTitleBar" type="switch">
				{{ t('talk_desktop', 'Use system title bar') }}
			</NcCheckboxRadioSwitch>
		</SettingsSubsection>

		<SettingsSubsection :name="t('talk_desktop', 'Notifications')">
			<SettingsSelect v-model="playSoundOption" :options="playSoundOptions">
				<template #icon>
					<IconBellOutline :size="20" />
				</template>
				{{ t('talk_desktop', 'Play notification sound') }}
			</SettingsSelect>

			<NcCheckboxRadioSwitch :checked.sync="showMessagePreviewInNotifications" type="switch">
				{{ t('talk_desktop', 'Show message text in the notification') }}
			</NcCheckboxRadioSwitch>
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
</style>
