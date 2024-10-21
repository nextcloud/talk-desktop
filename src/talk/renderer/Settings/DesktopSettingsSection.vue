<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import { t } from '@nextcloud/l10n'
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import NcCheckboxRadioSwitch from '@nextcloud/vue/dist/Components/NcCheckboxRadioSwitch.js'
import NcNoteCard from '@nextcloud/vue/dist/Components/NcNoteCard.js'
import IconThemeLightDark from 'vue-material-design-icons/ThemeLightDark.vue'
import SettingsSubsection from './components/SettingsSubsection.vue'
import SettingsSelect from './components/SettingsSelect.vue'
import { useAppConfigValue } from './useAppConfigValue.ts'
import { useNcSelectModel } from '../composables/useNcSelectModel.ts'
import { useAppConfig } from './appConfig.store.ts'
import { storeToRefs } from 'pinia'

const { isRelaunchRequired } = storeToRefs(useAppConfig())

const theme = useAppConfigValue('theme')
const themeOptions = [
	{ label: t('talk_desktop', 'System default'), value: 'default' } as const,
	{ label: t('talk_desktop', 'Light'), value: 'light' } as const,
	{ label: t('talk_desktop', 'Dark'), value: 'dark' } as const,
]
const themeOption = useNcSelectModel(theme, themeOptions)

const systemTitleBar = useAppConfigValue('systemTitleBar')
const monochromeTrayIcon = useAppConfigValue('monochromeTrayIcon')

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
				<NcButton type="primary"
					size="small"
					class="relaunch-require-note-card__button"
					@click="relaunch">
					{{ t('talk_desktop', 'Restart') }}
				</NcButton>
			</div>
		</NcNoteCard>

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
