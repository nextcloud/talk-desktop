<!--
  - SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import DevMenu from './components/DevMenu.vue'
import MainMenu from './components/MainMenu.vue'
import UserMenu from './components/UserMenu.vue'
import { BUILD_CONFIG } from '../../../shared/build.config.ts'
import { useDevMode } from '../../../shared/useDevMode.ts'
import { useAppConfigStore } from '../Settings/appConfig.store.ts'
import { useHeartbeat } from '../UserStatus/useHeartbeat.ts'
import { useUserStatusStore } from '../UserStatus/userStatus.store.ts'

useUserStatusStore()
useHeartbeat()
useAppConfigStore()

const channel = __CHANNEL__

const OS = window.systemInfo

const applicationName = BUILD_CONFIG.applicationName

const { isDevMode } = useDevMode()
</script>

<template>
	<header class="title-bar">
		<div class="title-bar__inner">
			<template v-if="!OS.isMac">
				<div class="title-bar__title">
					{{ applicationName }}
				</div>

				<div v-if="channel !== 'stable'" class="title-bar__channel">
					{{ channel }}
				</div>
			</template>

			<div class="spacer" />

			<div v-if="isDevMode" class="title-bar__item" data-theme-dark>
				<DevMenu />
			</div>

			<div class="title-bar__item" data-theme-dark>
				<MainMenu />
			</div>

			<div class="title-bar__item">
				<UserMenu />
			</div>
		</div>
	</header>
</template>

<style scoped>
.title-bar {
	display: flex;
	height: var(--header-height);
	margin-bottom: calc(-1 * var(--header-height));
	box-sizing: border-box;
	color: var(--color-background-plain-text);
	user-select: none;
}

.title-bar__inner {
	flex: 1;
	display: flex;
	align-items: center;
	height: 100%;
	/* Save space for native title bar buttons */
	/* Note: titlebar-area-x always represents left offset */
	/* Logical properties cannot be used here */
	margin-inline: env(titlebar-area-x, 0) auto;
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
