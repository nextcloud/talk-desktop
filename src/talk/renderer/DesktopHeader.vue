<!--
  - SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<header id="header" class="header">
		<div class="header__inner">
			<!--			<div v-if="!OS.isMac"-->
			<!--				class="header__title-wrapper"-->
			<!--				role="button"-->
			<!--				tabindex="0"-->
			<!--				@click="pushToRoot">-->
			<!--				<span class="header__title">Nextcloud Talk</span>-->
			<!--				<span class="header__preview-badge">Preview</span>-->
			<!--			</div>-->

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

<script>
import MainMenu from './components/MainMenu.vue'
import UserMenu from './components/UserMenu.vue'
import { appData } from '../../app/AppData.js'
import { useUserStatusStore } from './UserStatus/userStatus.store.js'
import { useUserStatusHeartbeat } from './UserStatus/useUserStatusHeartbeat.js'

export default {
	name: 'DesktopHeader',

	components: {
		MainMenu,
		UserMenu,
	},

	setup() {
		const userStatusStore = useUserStatusStore()
		useUserStatusHeartbeat()

		return {
			userStatusStore,
			user: appData.userMetadata,
			OS: window.OS,
		}
	},

	mounted() {
		window.addEventListener('keydown', (event) => {
			if (event.key === 'Escape' && document.activeElement === document.body) {
				this.pushToRoot()
			}
		}, { capture: true })
	},

	methods: {
		getTalkRouter() {
			return window.OCA.Talk.instance.$router
		},

		pushToRoot() {
			this.getTalkRouter().push({ name: 'root' }).catch(() => {})
		},

		logout() {
			window.TALK_DESKTOP.logout()
		},
	},
}
</script>

<style>
:root {
	--talk-desktop-menu: calc(100vw - (env(titlebar-area-width, 100vw) - 54px));
}

body:has(.app-sidebar[style='display: none;']) .top-bar {
	padding-right: var(--talk-desktop-menu) !important;
}

.app-sidebar-header__desc {
	padding-right: calc(50px + var(--talk-desktop-menu)) !important;
}

.app-sidebar__close {
	right: calc(6px + var(--talk-desktop-menu)) !important;
}
</style>

<style scoped>
.header {
	height: 60px;
	box-sizing: border-box;
	/*margin-bottom: -50px;*/
	color: #FFF;
	position: absolute;
	top: 0;
	right: calc(100vw - env(titlebar-area-width, 100vw));
	z-index: 1000;
}

.header__inner {
	padding: 0 calc(var(--body-container-margin) + 4px) 0 var(--body-container-margin);
	display: flex;
	align-items: center;
	height: 100%;
	/* Save space for native title bar buttons */
	margin-inline-start: env(titlebar-area-x, 0);
}

.header__item {
	width: 50px;
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
	/*app-region: drag;*/
}
</style>
