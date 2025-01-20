<!--
  - SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import MainMenu from './components/MainMenu.vue'
import UserMenu from './components/UserMenu.vue'
import { appData } from '../../../app/AppData.js'
import { useUserStatusStore } from '../UserStatus/userStatus.store.ts'
import { useAppConfigStore } from '../Settings/appConfig.store.ts'
import { useUserStatusHeartbeat } from '../UserStatus/useUserStatusHeartbeat.ts'
import { openRoot } from '../TalkWrapper/talk.service.ts'

useUserStatusStore()
useUserStatusHeartbeat()
useAppConfigStore()

const channel = __CHANNEL__

// TODO: add a proper type for userMetadata
const user = appData.userMetadata! as { id: string; 'display-name': string }
const OS = window.systemInfo

/**
 * Logout in Talk Desktop
 */
function logout() {
	window.TALK_DESKTOP.logout()
}
</script>

<template>
	<header class="title-bar">
		<div class="title-bar__inner">
			<template v-if="!OS.isMac">
				<div class="title-bar__title"
					role="button"
					tabindex="0"
					@click="openRoot">
					Nextcloud Talk
				</div>

				<div v-if="channel !== 'stable'" class="title-bar__channel">
					{{ channel }}
				</div>
			</template>

			<div class="spacer" />

			<div class="title-bar__item" data-theme-dark>
				<MainMenu />
			</div>

			<div class="title-bar__item">
				<UserMenu :user="user" @logout="logout" />
			</div>
		</div>
	</header>
</template>

<style scoped>
.title-bar {
	height: var(--header-height);
	margin-bottom: calc(-1 * var(--header-height));
	box-sizing: border-box;
	color: var(--color-header-contrast);
	user-select: none;
}

.title-bar__inner {
	display: flex;
	align-items: center;
	height: 100%;
	/* Save space for native title bar buttons */
	/* Note: titlebar-area-x always represents left offset */
	/* Logical properties cannot be used here */
	margin-left: env(titlebar-area-x, 0);
	margin-right: auto;
	max-width: env(titlebar-area-width, 100%);
	/* Inline with navigation items */
	padding-inline-start: calc(3 * var(--default-grid-baseline));
}

.title-bar__item {
	width: var(--header-height); /* Make it square */
	display: flex;
	justify-content: center;
}

.title-bar__title {
	margin-inline-end: calc(var(--default-grid-baseline) * 2);
	position: relative;
	font-size: 18px;
	font-weight: bold;
	&:focus-visible::after {
		bottom: 0;
	}
}

.title-bar__channel {
	text-transform: capitalize;
}

.spacer {
	flex: 1 0 auto;
	height: 100%;
	-webkit-app-region: drag;
}
</style>
