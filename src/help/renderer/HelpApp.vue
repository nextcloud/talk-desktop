<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'

import MdiWindowClose from 'vue-material-design-icons/WindowClose.vue'
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import NcTextArea from '@nextcloud/vue/dist/Components/NcTextArea.js'

import { translate as t } from '@nextcloud/l10n'
import { appData } from '../../app/AppData.js'

const packageInfo = window.TALK_DESKTOP.packageInfo

const report = [
	'----------------------------System report----------------------------',
	`Nextcloud Talk Desktop version ${window.TALK_DESKTOP.packageInfo.version}`,
	`- Built with Nextcloud Talk version ${window.TALK_DESKTOP.packageInfo.talkVersion}`,
	'',
	...(appData.credentials
		? [
			'Connected to:',
			`- Server address: ${appData.serverUrl}`,
			`- Nextcloud Server version ${appData.version.nextcloud.string}`,
			`- Nextcloud Talk version ${appData.version.talk}`,
		]
		: ['Not connected to any server']),
	'',
	`OS: ${window.OS.version}`,
	'----------------------------System report----------------------------',
].join('\n')

/**
 * Handle the escape key to close the window
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleEscape(event) {
	if (event.key === 'Escape') {
		close()
	}
}

/**
 * Close the window
 */
function close() {
	window.close()
}

onMounted(() => {
	window.addEventListener('keyup', handleEscape)
})

onBeforeUnmount(() => {
	window.removeEventListener('keyup', handleEscape)
})
</script>

<template>
	<div class="about">
		<h2>{{ t('talk_desktop', 'About') }}</h2>
		<p>{{ packageInfo.productName }} - {{ packageInfo.description }}</p>
		<ul class="about__list">
			<li>
				{{ t('talk_desktop', 'Privacy and Legal Policy') }}: <a class="link" href="https://nextcloud.com/privacy/" target="_blank">https://nextcloud.com/privacy/</a>
			</li>
			<li>
				{{ t('talk_desktop', 'License') }}: <a class="link" href="https://www.gnu.org/licenses/agpl-3.0.txt" target="_blank">{{ packageInfo.license }}</a>
			</li>
			<li>
				{{ t('talk_desktop', 'Issues') }}: <a :href="packageInfo.bugs" class="link" target="_blank">{{ packageInfo.bugs }}</a>
			</li>
			<li>
				{{ t('talk_desktop', 'Source Code') }}: <a :href="packageInfo.repository" class="link" target="_blank">{{ packageInfo.repository }}</a>
			</li>
		</ul>
		<NcTextArea :aria-label="t('talk_desktop', 'System report')"
			:value="report"
			rows="11"
			readonly
			class="about__report"
			@focus="$event.target.setSelectionRange(0, -1)" />
		<p>
			<NcButton type="secondary" wide @click="close">
				<template #icon>
					<MdiWindowClose />
				</template>
				{{ t('talk_desktop', 'Close') }}
			</NcButton>
		</p>
	</div>
</template>

<style scoped>
.about {
	height: 100%;
	background: var(--color-main-background);
	padding: 15px;
}

.about__list {
	list-style: '-' inside;
}

.about__report {
	width: 100%;
	resize: none;
}

.about .link {
	text-decoration: underline;
}
</style>
