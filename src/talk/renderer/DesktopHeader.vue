<!--
  - SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup>
import { onMounted, onUnmounted } from 'vue'
import MainMenu from './components/MainMenu.vue'
import UserMenu from './components/UserMenu.vue'
import { appData } from '../../app/AppData.js'
import { useUserStatusStore } from './UserStatus/userStatus.store.js'
import { useAppConfigStore } from './Settings/appConfig.store.ts'
import { useUserStatusHeartbeat } from './UserStatus/useUserStatusHeartbeat.js'

useUserStatusStore()
useUserStatusHeartbeat()
useAppConfigStore()

const isPreview = false

const user = appData.userMetadata
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

/**
 * Handle the global escape key to unselect any chat
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleGlobalEscape(event) {
	if (event.key === 'Escape' && document.activeElement === document.body) {
		pushToRoot()
	}
}

onMounted(() => {
	window.addEventListener('keydown', handleGlobalEscape, { capture: true })
})

onUnmounted(() => {
	window.removeEventListener('keydown', handleGlobalEscape, { capture: true })
})
</script>

<template>
	<header id="header" class="header">
		<div class="header__inner">
			<div v-if="!OS.isMac"
				class="header__title-wrapper"
				role="button"
				tabindex="0"
				@click="pushToRoot">
				<span class="header__title">Nextcloud Talk</span>
				<span v-if="isPreview" class="header__preview-badge">Preview</span>
			</div>

			<div class="spacer" />

			<div class="header__item" data-theme-dark>
				<MainMenu />
			</div>

			<div class="header__item">
				<UserMenu :user="user" @logout="logout" />
			</div>
		</div>
	</header>
</template>

<style scoped>
.header {
	height: var(--header-height);
	margin-bottom: calc(-1 * var(--header-height));
	box-sizing: border-box;
	color: var(--color-header-contrast);
	user-select: none;
}

.header__inner {
	padding: 0 calc(var(--body-container-margin) + 4px) 0 var(--body-container-margin);
	display: flex;
	align-items: center;
	height: 100%;
	/* Save space for native title bar buttons */
	x-margin-inline-start: env(titlebar-area-x, 0);
	margin-inline-start: 300px;
	background-color: var(--color-main-background-macos);
	x-width: env(titlebar-area-width, 100%);
	width: calc(100% - 300px);
}

.header__item {
	width: var(--header-height); /* Make it square */
	display: flex;
	justify-content: center;
}

.header__title-wrapper {
	display: flex;
	align-items: center;
	height: 100%;
	margin-inline-start: calc(var(--default-grid-baseline) * 3);
	position: relative;

	&:focus-visible::after {
		bottom: 0;
	}
}

.header__title {
	font-size: 18px;
	font-weight: bold;
}

.header__preview-badge {
	margin-inline-start: var(--default-grid-baseline);
}

.spacer {
	flex: 1 0 auto;
	height: 100%;
	/* Allow to drag the window using header */
	app-region: drag;
}
</style>
