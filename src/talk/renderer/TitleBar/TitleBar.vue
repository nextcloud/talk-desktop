<!--
  - SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import { useHotKey } from '@nextcloud/vue/dist/Composables/useHotKey.js'
import MainMenu from './components/MainMenu.vue'
import UserMenu from './components/UserMenu.vue'
import { appData } from '../../../app/AppData.js'
import { useUserStatusStore } from '../UserStatus/userStatus.store.ts'
import { useAppConfigStore } from '../Settings/appConfig.store.ts'
import { useUserStatusHeartbeat } from '../UserStatus/useUserStatusHeartbeat.ts'

useUserStatusStore()
useUserStatusHeartbeat()
useAppConfigStore()

const isPreview = false

// TODO: add a proper type for userMetadata
const user = appData.userMetadata! as { id: string; 'display-name': string }
const OS = window.systemInfo

/**
 * Push to root in Talk app to unselect any chat
 */
function pushToRoot() {
	window.OCA.Talk.instance?.$router?.push({ name: 'root' }).catch(() => {})
}

/**
 * Logout in Talk Desktop
 */
function logout() {
	window.TALK_DESKTOP.logout()
}

// Unselect chat by escape key
useHotKey('Escape', pushToRoot)
</script>

<template>
	<header id="header" class="title-bar">
		<div class="title-bar__inner">
			<div v-if="!OS.isMac"
				class="title-bar__title-wrapper"
				role="button"
				tabindex="0"
				@click="pushToRoot">
				<span class="title-bar__title">Nextcloud Talk</span>
				<span v-if="isPreview" class="title-bar__preview-badge">Preview</span>
			</div>

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
	padding: 0 calc(var(--body-container-margin) + 4px) 0 var(--body-container-margin);
	display: flex;
	align-items: center;
	height: 100%;
	/* Save space for native title bar buttons */
	/* Note: titlebar-area-x always represents left offset */
	/* Logical properties cannot be used here */
	margin-left: env(titlebar-area-x, 0);
	margin-right: auto;
	width: env(titlebar-area-width, 100%);
}

.title-bar__item {
	width: var(--header-height); /* Make it square */
	display: flex;
	justify-content: center;
}

.title-bar__title-wrapper {
	display: flex;
	align-items: center;
	height: 100%;
	margin-inline-start: calc(var(--default-grid-baseline) * 3);
	position: relative;

	&:focus-visible::after {
		bottom: 0;
	}
}

.title-bar__title {
	font-size: 18px;
	font-weight: bold;
}

.title-bar__preview-badge {
	margin-inline-start: var(--default-grid-baseline);
}

.spacer {
	flex: 1 0 auto;
	height: 100%;
	/* Allow to drag the window using header */
	-webkit-app-region: drag;
}
</style>
