<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import { t } from '@nextcloud/l10n'
import { useEventListener } from '@vueuse/core'
import NcAvatar from '@nextcloud/vue/components/NcAvatar'
import NcButton from '@nextcloud/vue/components/NcButton'
import IconClose from 'vue-material-design-icons/Close.vue'
import IconPhoneHangupOutline from 'vue-material-design-icons/PhoneHangupOutline.vue'
import IconPhoneOutline from 'vue-material-design-icons/PhoneOutline.vue'
import AppWindow from '../../shared/components/AppWindow.vue'
import { postBroadcast } from '../../shared/broadcast.service.ts'
import { waitCurrentUserHasJoinedCall } from './callbox.service.ts'
import { playRingtone } from './callbox.utils.ts'

const AVATAR_SIZE = 15 * 1.5 * 2 // 2 lines
const TIME_LIMIT = 45 * 1000

const params = new URLSearchParams(window.location.search)

const token = params.get('token')!
const name = params.get('name')!
const avatar = params.get('avatar')!
const type = params.get('type')! as 'one2one' | 'group' | 'public'
const debug = params.get('debug') === 'true'

useEventListener('keydown', (event) => {
	if (event.key === 'Escape') {
		dismiss()
	}
})

playRingtone()

waitCurrentUserHasJoinedCall(token, TIME_LIMIT).then((joined) => {
	console.log(`Callbox popup is not actual anymore: ${joined ? 'the user has joined the call' : 'missed call'}`)
	if (debug) {
		return
	}
	if (!joined) {
		postBroadcast('notifications:missedCall', { name, token, type, avatar })
	}
	window.close()
})

/**
 * Join the call
 */
async function join() {
	postBroadcast('talk:conversation:open', { token, directCall: true })
	window.close()
}

/**
 * Dismiss the call
 */
function dismiss() {
	window.close()
}
</script>

<template>
	<AppWindow class="callbox">
		<div class="callbox__info">
			<NcAvatar
				class="callbox__avatar"
				:url="avatar"
				:size="AVATAR_SIZE" />
			<div class="callbox__text">
				<div class="callbox__title">
					{{ name }}
				</div>
				<div class="callbox__subtitle">
					{{ t('talk_desktop', 'Incoming call') }}
				</div>
			</div>
			<NcButton
				class="callbox__quit"
				:aria-label="t('talk_desktop', 'Close')"
				variant="tertiary-no-background"
				size="small"
				@click="dismiss">
				<template #icon>
					<IconClose :size="20" />
				</template>
			</NcButton>
		</div>

		<div class="callbox__actions">
			<NcButton
				variant="error"
				alignment="center"
				wide
				@click="dismiss">
				<template #icon>
					<IconPhoneHangupOutline :size="20" />
				</template>
				{{ t('talk_desktop', 'Dismiss') }}
			</NcButton>
			<NcButton
				variant="success"
				alignment="center"
				wide
				@click="join">
				<template #icon>
					<IconPhoneOutline :size="20" />
				</template>
				{{ t('talk_desktop', 'Join call') }}
			</NcButton>
		</div>
	</AppWindow>
</template>

<style>
:root {
	--join-call-background-color: var(--color-border-success);
	--join-call-border-color: var(--color-success-text);
}

[data-theme-dark] {
	--join-call-border-color: var(--color-success-hover);
}

@media (prefers-color-scheme: dark) {
	:root {
		--join-call-border-color: var(--color-success-hover);
	}
}
</style>

<style scoped>
.callbox {
	--height: calc(var(--default-clickable-area) * 2 + var(--default-grid-baseline) * 2 * 3);
	--gap: calc(var(--default-grid-baseline) * 3);
	display: flex;
	flex-direction: column;
	gap: var(--gap);
	padding: var(--gap);
	user-select: none;
	backdrop-filter: blur(12px);
	background: rgba(0, 0, 0, .2);
	color: var(--color-background-plain-text);
	-webkit-app-region: drag;

	/* FIXME: hotfix for the broken success/danger buttons on the dark theme */
	.button-vue--success {
		border-color: var(--join-call-border-color);
		background-color: var(--join-call-background-color);
		color: var(--color-primary-element-text);

		&:hover:not(:disabled) {
			background-color: var(--join-call-border-color) !important;
		}
	}

	.button-vue--error {
		background-color: #FF3333; /* Nextcloud 31 --color-error */
		color: var(--color-primary-text);
	}
}

.callbox button {
	-webkit-app-region: no-drag;
}

.callbox__info {
	display: flex;
	align-items: center;
	gap: var(--gap);
}

.callbox__avatar {
	animation: pulse-shadow 2s infinite;
}

.callbox__text {
	overflow: hidden;
	flex: 1 0;
	display: flex;
	flex-direction: column;
}

.callbox__title {
	overflow: hidden;
	font-weight: bold;
	text-wrap: nowrap;
	text-overflow: ellipsis;
}

.callbox__quit {
	color: var(--color-background-plain-text) !important;
	align-self: flex-start;
}

.callbox__actions {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: var(--gap);
}

@keyframes pulse-shadow {
	0% {
		box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
	}
	100% {
		box-shadow: 0 0 0 calc(var(--gap) - var(--default-grid-baseline)) rgba(255, 255, 255, 0);
	}
}
</style>
