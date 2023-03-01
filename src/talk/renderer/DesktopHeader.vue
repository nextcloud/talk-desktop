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
		<img class="header__item header__logo" src="~@talk/img/app.svg" alt="Talk Logo">
		<h2 class="header__item header__title">
			Nextcloud Talk
		</h2>
		<div class="header__item">{{ version }}</div>
		<div class="header__logout">
			<NcButton @click="logout">
				<template #icon>
					<ExitToApp />
				</template>
				Log out
			</NcButton>
		</div>
	</header>
</template>

<script>
import ExitToApp from 'vue-material-design-icons/ExitToApp.vue'
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import { appData } from '../../app/AppData.js'

export default {
	name: 'DesktopHeader',

	components: {
		NcButton,
		ExitToApp,
	},

	setup() {
		const logout = () => {
			window.TALK_DESKTOP.logout()
		}

		return {
			version: appData.version.desktop,
			logout,
		}
	},
}
</script>

<style scoped>
.header {
	height: 50px;
	box-sizing: border-box;
	margin-bottom: -50px;
	color: #FFF;
	padding: 0 0.5rem;
	display: flex;
	align-items: center;
}

.header__item {
	margin: 0 0.5rem;
}

.header__logo {
	height: 32px;
}

.header__title {
	color: inherit;
}

.header__logout {
	margin-left: auto;
}
</style>
