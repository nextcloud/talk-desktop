<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
/* eslint-disable jsdoc/require-jsdoc */
import { getCurrentUser } from '@nextcloud/auth'
import axios from '@nextcloud/axios'
import { generateOcsUrl, generateUrl } from '@nextcloud/router'
import NcActionButton from '@nextcloud/vue/components/NcActionButton'
import NcActions from '@nextcloud/vue/components/NcActions'
import NcActionSeparator from '@nextcloud/vue/components/NcActionSeparator'
import IconApplicationBracketsOutline from 'vue-material-design-icons/ApplicationBracketsOutline.vue'
import IconCardAccountPhoneOutline from 'vue-material-design-icons/CardAccountPhoneOutline.vue'
import IconConsole from 'vue-material-design-icons/Console.vue'
import IconDeveloperBoard from 'vue-material-design-icons/DeveloperBoard.vue'
import IconLan from 'vue-material-design-icons/Lan.vue'
import IconMessageBadge from 'vue-material-design-icons/MessageBadge.vue'
import IconMessageBadgeOutline from 'vue-material-design-icons/MessageBadgeOutline.vue'
import IconMonitorShare from 'vue-material-design-icons/MonitorShare.vue'
import { appData } from '../../../../app/AppData.js'

const supportsTestAdminNotification = appData.capabilities?.notifications?.['admin-notifications']?.includes('ocs') && appData.userMetadata?.groups.includes('admin')
const supportsTestPushNotification = appData.capabilities?.notifications?.['ocs-endpoints']?.includes('test-push')
const supportsTestNotification = supportsTestPushNotification || supportsTestAdminNotification

async function openDevTools() {
	window.TALK_DESKTOP.toggleDevTools()
}

async function triggerScreenSharing() {
	console.log(await window.OCA.Talk.Desktop.getDesktopMediaSource())
}

async function triggerNotification() {
	window.TALK_DESKTOP.flashAppIcon(true)

	const n = new Notification('Notification title', {
		// FIXME: type appData
		lang: (appData.userMetadata as unknown as { locale: string }).locale,
		body: 'Notification body: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
		tag: Math.random().toString(36).slice(2),
		silent: true,
	})
	n.addEventListener('click', () => {
		window.TALK_DESKTOP.focusTalk()
		console.log('Notification clicked')
	}, false)
}

async function requestTestAdminNotification() {
	try {
		await axios.post(generateOcsUrl('/apps/notifications/api/v3/admin_notifications/{uid}', { uid: getCurrentUser()!.uid }), {
			subject: 'Test Push Notification',
			message: 'This is a test push notification triggered by the Talk Desktop client',
		})
		console.log('Requested test notification')
		console.time('debug:notification:test-push')
	} catch (error) {
		console.error('Failed to request test notification', error)
	}
}

async function requestTestPushNotification() {
	try {
		await axios.post(generateOcsUrl('/apps/notifications/api/v3/test/self'))
		console.log('Requested test notification')
		console.time('debug:notification:test-push')
	} catch (error) {
		console.error('Failed to request test notification', error)
	}
}

function requestTestNotification() {
	if (supportsTestPushNotification) {
		requestTestPushNotification()
	} else if (supportsTestAdminNotification) {
		requestTestAdminNotification()
	}
}

function triggerCallbox() {
	if (!location.hash.startsWith('#/call/')) {
		console.log('Trigger callbox is only available when there is current conversation')
		return
	}
	window.TALK_DESKTOP.showCallbox({
		token: location.hash.slice('#/call/'.length),
		name: 'Test Call Popup',
		type: 'one2one',
		avatar: generateUrl(`/avatar/${getCurrentUser()?.uid}/64`),
		debug: 'true',
	})
}

async function invokeAnything() {
	console.log(await window.TALK_DESKTOP.invokeAnything())
}

async function openChromeWebRtcInternals() {
	window.TALK_DESKTOP.openChromeWebRtcInternals()
}
</script>

<template>
	<NcActions
		aria-label="Dev Menu"
		variant="tertiary-no-background"
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

		<NcActionSeparator />

		<NcActionButton @click="invokeAnything">
			<template #icon>
				<IconConsole :size="20" />
			</template>
			Invoke 'app:anything'
		</NcActionButton>

		<NcActionSeparator />

		<NcActionButton @click="triggerScreenSharing">
			<template #icon>
				<IconMonitorShare :size="20" />
			</template>
			Screen share picker
		</NcActionButton>

		<NcActionSeparator />

		<NcActionButton @click="triggerNotification">
			<template #icon>
				<IconMessageBadgeOutline :size="20" />
			</template>
			Show Notification
		</NcActionButton>
		<NcActionButton v-if="supportsTestNotification" @click="requestTestNotification">
			<template #icon>
				<IconMessageBadge :size="20" />
			</template>
			Request Test Notification
		</NcActionButton>
		<NcActionButton @click="triggerCallbox">
			<template #icon>
				<IconCardAccountPhoneOutline :size="20" />
			</template>
			Show Call Popup
		</NcActionButton>

		<NcActionSeparator />

		<NcActionButton @click="openChromeWebRtcInternals">
			<template #icon>
				<IconLan :size="20" />
			</template>
			Open chrome://webrtc-internals
		</NcActionButton>
	</NcActions>
</template>
