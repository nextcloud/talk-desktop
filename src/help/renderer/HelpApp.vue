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
import AppWindow from '../../shared/components/AppWindow.vue'
import ButtonCopy from './ButtonCopy.vue'
import TalkLogo from '../../../img/talk-icon-rounded.svg'
import { BUILD_CONFIG } from '../../shared/build.config.ts'
import { useDevMode } from '../../shared/useDevMode.ts'
import { generateDiagnosisReportMD } from './diagnosis.service.ts'

const packageInfo = window.TALK_DESKTOP.packageInfo
const isMac = window.systemInfo.isMac

const report = generateDiagnosisReportMD()
const reportToCopy = '### Diagnosis report\n' + report

useHotKey('Escape', close)

const logoClicked = ref(0)
const { isDevMode } = useDevMode()
whenever(() => logoClicked.value === 5, () => {
	isDevMode.value = !isDevMode.value
	logoClicked.value = 0
})

/**
 * Close the window
 */
function close() {
	window.close()
}
</script>

<template>
	<AppWindow :title="t('talk_desktop', 'About')" class="help">
		<div class="help__content">
			<div class="help__info-col">
				<h2>{{ t('talk_desktop', 'About') }}</h2>
				<div class="help__info">
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
			</div>
			<div class="help__report-col">
				<div class="help__report-heading-bar">
					<h2>{{ t('talk_desktop', 'Diagnosis report') }}</h2>
					<ButtonCopy :content="reportToCopy" variant="tertiary">
						{{ t('talk_desktop', 'Copy report') }}
					</ButtonCopy>
				</div>
				<NcRichText class="help__report" :text="report" use-extended-markdown />
			</div>
		</div>
		<div v-if="isMac" class="help__button-bar">
			<NcButton variant="tertiary" @click="close">
				{{ t('talk_desktop', 'Done') }}
			</NcButton>
		</div>
	</AppWindow>
</template>

<style scoped>
.help {
	padding-block: calc(4 * var(--default-grid-baseline));
	padding-inline: calc(4 * var(--default-grid-baseline));
	display: flex;
	flex-direction: column;
	gap: calc(4 * var(--default-grid-baseline));
	user-select: none;
	-webkit-app-region: drag;
}

.help__content {
	flex: 1 0;
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: calc(8 * var(--default-grid-baseline));
	height: 0;
}

.help h2 {
	margin-block: 0;
	font-size: 22px;
}

.help .link {
	text-decoration: underline;
}

.help button {
	-webkit-app-region: no-drag;
}

.help__info-col {
	flex: 0 0 fit-content;
	display: flex;
	flex-direction: column;
	gap: calc(4 * var(--default-grid-baseline));
	padding-inline-start: calc(4 * var(--default-grid-baseline));
}

.help__info {
	user-select: text;
	-webkit-app-region: no-drag;
}

.help__info p {
	margin: 0.5em 0;
}

.help__report-col {
	display: flex;
	flex-direction: column;
	gap: calc(4 * var(--default-grid-baseline));
	flex: 1 0;
	width: 0;
	height: 100%;
}

.help__report-heading-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.help__report {
	background-color: var(--color-main-background);
	border-radius: var(--border-radius-small);
	padding: calc(var(--default-grid-baseline) * 4);
	flex: 1 1 auto;
	overflow: auto;
	font-size: 13px;
	user-select: text;
	-webkit-app-region: no-drag;
}

.help__report :deep(h6) {
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

.help__button-bar {
	display: flex;
	justify-content: flex-end;
}
</style>
