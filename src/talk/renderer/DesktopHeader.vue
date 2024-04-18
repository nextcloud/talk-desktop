<!--
  - @copyright Copyright (c) 2022 Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
  -
  - @author Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
  -
  - @license GNU AGPL version 3 or any later version
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
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

			<div class="header__item">
				<UserMenu :user="user" @logout="logout" />
			</div>
		</div>
	</header>
</template>

<script>
import UserMenu from './components/UserMenu.vue'
import { appData } from '../../app/AppData.js'

export default {
	name: 'DesktopHeader',

	components: {
		UserMenu,
	},

	setup() {
		return {
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

		showNotSupportedAlert(feature) {
			alert(`Unfortunately, ${feature} is not currently supported by Nextcloud Talk Desktop`)
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
