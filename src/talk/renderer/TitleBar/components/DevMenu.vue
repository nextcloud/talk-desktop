<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
/* eslint-disable jsdoc/require-jsdoc */
import NcActions from '@nextcloud/vue/dist/Components/NcActions.js'
import NcActionButton from '@nextcloud/vue/dist/Components/NcActionButton.js'
import IconApplicationBracketsOutline from 'vue-material-design-icons/ApplicationBracketsOutline.vue'
import IconDeveloperBoard from 'vue-material-design-icons/DeveloperBoard.vue'
import IconMonitorShare from 'vue-material-design-icons/MonitorShare.vue'
import IconMessageBadgeOutline from 'vue-material-design-icons/MessageBadgeOutline.vue'
import IconConsole from 'vue-material-design-icons/Console.vue'
import { appData } from '../../../../app/AppData.js'

async function openDevTools() {
	window.TALK_DESKTOP.toggleDevTools()
}

async function triggerScreenSharing() {
	console.log(await window.OCA.Talk.Desktop.getDesktopMediaSource())
}

async function triggerNotification() {
	window.TALK_DESKTOP.setBadgeCount()
	window.TALK_DESKTOP.flashAppIcon(true)

	const n = new Notification('Notification title', {
		// FIXME: type appData
		lang: (appData.userMetadata as unknown as { locale: string }).locale,
		body: 'Notification body: ' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
		tag: Math.random().toString(36).slice(2),
		silent: true,
	})
	n.addEventListener('click', () => {
		window.TALK_DESKTOP.focusTalk()
		console.log('Notification clicked')
	}, false)
}

async function invokeAnything() {
	console.log(await window.TALK_DESKTOP.invokeAnything())
}
</script>

<template>
	<NcActions aria-label="Dev Menu"
		type="tertiary-no-background"
		container="body"
		force-menu>
		<template #icon>
			<IconDeveloperBoard :size="20" fill-color="var(--color-header-contrast)" />
		</template>
		<NcActionButton @click="openDevTools">
			<template #icon>
				<IconApplicationBracketsOutline :size="20" />
			</template>
			Toggle Developer Tools
		</NcActionButton>
		<NcActionButton @click="invokeAnything">
			<template #icon>
				<IconConsole :size="20" />
			</template>
			Invoke 'app:anything'
		</NcActionButton>
		<NcActionButton @click="triggerScreenSharing">
			<template #icon>
				<IconMonitorShare :size="20" />
			</template>
			Screen share picker
		</NcActionButton>
		<NcActionButton @click="triggerNotification">
			<template #icon>
				<IconMessageBadgeOutline :size="20" />
			</template>
			Notification
		</NcActionButton>
	</NcActions>
</template>
