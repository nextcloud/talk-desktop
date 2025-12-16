<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { translate as t } from '@nextcloud/l10n'
import { useHotKey } from '@nextcloud/vue/composables/useHotKey'
import { whenever } from '@vueuse/core'
import { ref } from 'vue'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcRichText from '@nextcloud/vue/components/NcRichText'
import IconWindowClose from 'vue-material-design-icons/WindowClose.vue'
import AppWindow from '../../shared/components/AppWindow.vue'
import ButtonCopy from './ButtonCopy.vue'
import TalkLogo from '../../../img/talk-icon-rounded.svg'
import { BUILD_CONFIG } from '../../shared/build.config.ts'
import { useDevMode } from '../../shared/useDevMode.ts'
import { generateDiagnosisReportMD } from './diagnosis.service.ts'

const packageInfo = window.TALK_DESKTOP.packageInfo
const isMac = window.systemInfo.isMac

const report = generateDiagnosisReportMD()

useHotKey('Escape', close)

const logoClicked = ref(0)
const { isDevMode } = useDevMode()
whenever(() => logoClicked.value === 5, () => {
	isDevMode.value = !isDevMode.value
	logoClicked.value = 0
})

// Reduce heading levels for GitHub
const reportToCopy = report.replaceAll('# ', '### ')

/**
 * Close the window
 */
function close() {
	window.close()
}
</script>

<template>
	<AppWindow :title="t('talk_desktop', 'About')" class="help">
		<div class="help__title-bar" :class="{ 'help__title-bar--mac': isMac }">
			<NcButton
				:aria-label="t('talk_desktop', 'Close')"
				variant="tertiary"
				wide
				@click="close">
				<template #icon>
					<IconWindowClose :size="20" />
				</template>
			</NcButton>
		</div>

		<div class="help__content">
			<div class="help__info no-drag">
				<img
					:src="TalkLogo"
					width="72"
					alt=""
					draggable="false"
					@click="logoClicked += 1">
				<p><strong>{{ BUILD_CONFIG.applicationName }}{{ isDevMode ? ' 👾' : '' }}</strong></p>
				<p v-if="!BUILD_CONFIG.isBranded">
					{{ BUILD_CONFIG.description }}
				</p>
				<p>
					<a class="link" :href="BUILD_CONFIG.privacyUrl" target="_blank">{{ t('talk_desktop', 'Privacy and Legal Policy') }}</a><br>
					{{ t('talk_desktop', 'License') }}: <a class="link" href="https://www.gnu.org/licenses/agpl-3.0.txt" target="_blank">{{ packageInfo.license }}</a>
				</p>
				<p v-if="!BUILD_CONFIG.isBranded">
					<a :href="packageInfo.bugs.url" class="link" target="_blank">{{ t('talk_desktop', 'Issues') }}</a> | <a :href="packageInfo.repository" class="link" target="_blank">{{ t('talk_desktop', 'Source Code') }}</a>
				</p>
			</div>
			<div class="help__report-wrapper">
				<NcRichText
					class="help__report no-drag"
					:text="report"
					use-extended-markdown
					:markdown-css-classes="{
						h3: 'help__report-h3',
						h4: 'help__report-h4',
					}" />

				<div class="help__report-actions">
					<ButtonCopy type="tertiary" :content="reportToCopy">
						{{ t('talk_desktop', 'Copy report') }}
					</ButtonCopy>
				</div>
			</div>
		</div>
	</AppWindow>
</template>

<style scoped>
.no-drag {
	-webkit-app-region: no-drag;
}

.help {
	--spacing-4: calc(4 * var(--default-grid-baseline));
	-webkit-app-region: drag;
	padding: var(--spacing-4) var(--spacing-4) var(--spacing-4) 0;
	display: flex;
	flex-direction: column;
	gap: var(--spacing-4);
	position: relative;
}

.help button {
	-webkit-app-region: no-drag;
}

.help__title-bar {
	display: flex;
	justify-content: flex-end;
	&.help__title-bar--mac {
		justify-content: flex-start;
	}
}

.help__content {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	height: 0;
	flex: 1 0;
}

.help__info {
	flex: 1 0 auto;
	padding: 0 calc(16 * var(--default-grid-baseline));
	text-align: center;
}

.help__info p {
	margin: 0.5em 0;
}

.help__report-wrapper {
	display: flex;
	flex-direction: column;
	gap: calc(2 * var(--default-grid-baseline));
	flex: 0 1 auto;
	height: 100%;
}

.help__report {
	background-color: var(--color-main-background);
	border-radius: var(--border-radius-small);
	padding: calc(var(--default-grid-baseline) * 2);
	flex: 1 1 auto;
	overflow: auto;
	font-size: 13px;
}

.help__report :deep(h4),
.help__report :deep(h5) {
	font-weight: 500;
	margin-top: 0.5em;
	margin-bottom: 0.5em;
	&:first-child {
		margin-top: 0;
	}
}

.help__report :deep(strong) {
	font-weight: 500;
}

.help__report :deep(table) {
	border: 1px solid var(--color-border) !important;
	white-space: normal;
}

.help__report :deep(th),
.help__report :deep(td) {
	border-color: var(--color-border) !important;
	background-color: var(--color-main-background) !important;
}

.help__report :deep(.rich-text__code-block) {
	background-color: var(--color-main-background) !important;
}

.help__report-actions {
	display: flex;
	justify-content: space-around;
}

.help .link {
	text-decoration: underline;
}
</style>
