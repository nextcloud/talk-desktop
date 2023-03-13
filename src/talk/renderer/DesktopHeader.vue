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
	<header class="header">
		<!-- Nextcloud Apps use #header selector to get its height -->
		<!-- This is invisible stub with the same height -->
		<div id="header" class="header-stub" />

		<img class="header__logo" src="~@talk/img/app.svg" alt="Talk Logo">

		<div>
			<span class="header__title">Nextcloud Talk</span>
			<span class="header__preview-badge">Preview</span>
		</div>

		<div class="spacer" />

		<div class="header__item">
			<NcButton type="tertiary-no-background" class="header__button" @click="showNotSupportedAlert('Search')">
				<template #icon>
					<MdiMagnify />
				</template>
			</NcButton>
		</div>

		<div class="header__item">
			<NcButton type="tertiary-no-background" class="header__button" @click="showNotSupportedAlert('Notifications')">
				<template #icon>
					<MdiBell />
				</template>
			</NcButton>
		</div>

		<div class="header__item">
			<UserMenu :user="$options.userMetadata" @about="isAboutModalShown = true" @logout="logout" />
		</div>

		<AboutModal :show.sync="isAboutModalShown" />
	</header>
</template>

<script>
import MdiBell from 'vue-material-design-icons/Bell.vue'
import MdiMagnify from 'vue-material-design-icons/Magnify.vue'
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import UserMenu from './components/UserMenu.vue'
import { appData } from '../../app/AppData.js'
import AboutModal from './components/AboutModal.vue'

export default {
	name: 'DesktopHeader',

	userMetadata: appData.userMetadata,

	components: {
		AboutModal,
		MdiBell,
		MdiMagnify,
		NcButton,
		UserMenu,
	},

	data() {
		return {
			isAboutModalShown: false,
		}
	},

	methods: {
		logout() {
			window.TALK_DESKTOP.logout()
		},

		showNotSupportedAlert(feature) {
			alert(`Unfortunately, ${feature} is not currently supported by Nextcloud Talk Desktop`)
		},
	},
}
</script>

<style scoped>
.header-stub {
	height: 100%;
	position: absolute;
	z-index: -1;
}

.header {
	height: 50px;
	box-sizing: border-box;
	margin-bottom: -50px;
	color: #FFF;
	padding: 0 calc(var(--body-container-margin) + 4px) 0 var(--body-container-margin);
	display: flex;
	align-items: center;
	user-select: none;
}

.header__item {
	width: 50px;
	display: flex;
	justify-content: center;
}

.header__logo {
	height: 32px;
	margin: 0 14px 0 20px;
}

.header__title {
	font-size: 20px;
	font-weight: bold;
}

.header__preview-badge {
	margin-left: var(--default-grid-baseline);
}

.header__button {
	opacity: .85;
	/* We have to use !important here because NcButton already has !important */
	color: inherit !important;
	transition: opacity ease var(--animation-quick) !important;
}

.header__button:hover,
.header__button:active,
.header__button:focus-visible {
	color: inherit !important;
	opacity: 1;
}

.spacer {
	flex: 1 0 auto;
}
</style>
