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

		<div class="header__item">
			<span class="header__title">Nextcloud Talk</span>
			<span style="margin-left: var(--default-grid-baseline)">Preview</span>
		</div>

		<div class="spacer"></div>

		<NcButton type="tertiary-no-background" class="header__item header__button">
			<template #icon>
				<Magnify />
			</template>
		</NcButton>

		<NcButton type="tertiary-no-background" class="header__item header__button">
			<template #icon>
				<Bell />
			</template>
		</NcButton>

		<NcAvatar class="header__item" :user="user.id" @click.native="logout" />
<!--		<NcButton type="tertiary-no-background" class="header__item header__button" @click="logout">-->
<!--			<template #icon>-->
<!--				<ExitToApp />-->
<!--			</template>-->
<!--		</NcButton>-->
<!--		<NcActions class="header__item">-->
<!--			<NcActionButton @click="logout">-->
<!--				<template #icon>-->
<!--					<ExitToApp size="20" />-->
<!--				</template>-->
<!--				Log out-->
<!--			</NcActionButton>-->
<!--			<NcActionButton @click="logout">-->
<!--				<template #icon>-->
<!--					<ExitToApp size="20" />-->
<!--				</template>-->
<!--				Log out-->
<!--			</NcActionButton>-->
<!--		</NcActions>-->

<!--		<NcPopover class="header__item">-->
<!--			<template #trigger>-->
<!--				<NcAvatar :user="user.id" />-->
<!--			</template>-->

<!--			<NcActions>-->
<!--				<NcActionButton @click="logout">-->
<!--					<template #icon>-->
<!--						<ExitToApp size="20" />-->
<!--					</template>-->
<!--					Log out-->
<!--				</NcActionButton>-->
<!--				<NcActionButton @click="logout">-->
<!--					<template #icon>-->
<!--						<ExitToApp size="20" />-->
<!--					</template>-->
<!--					Log out-->
<!--				</NcActionButton>-->

<!--			</NcActions>-->
<!--		</NcPopover>-->
	</header>
</template>

<script>
import Bell from 'vue-material-design-icons/Bell.vue'
import ExitToApp from 'vue-material-design-icons/ExitToApp.vue'
import Magnify from 'vue-material-design-icons/Magnify.vue'
import NcActions from '@nextcloud/vue/dist/Components/NcActions.js'
import NcActionButton from '@nextcloud/vue/dist/Components/NcActionButton.js'
import NcAvatar from '@nextcloud/vue/dist/Components/NcAvatar.js'
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import NcPopover from '@nextcloud/vue/dist/Components/NcPopover.js'
import { appData } from '../../app/AppData.js'

export default {
	name: 'DesktopHeader',

	components: {
		Bell,
		ExitToApp,
		Magnify,
		NcActions,
		NcActionButton,
		NcAvatar,
		NcButton,
		NcPopover,
	},

	setup() {
		const logout = () => {
			window.TALK_DESKTOP.logout()
		}

		return {
			version: appData.version.desktop,
			user: appData.userMetadata,
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
	font-size: 20px;
	font-weight: bold;
}

.header__button {
	color: inherit;
	opacity: .85;
	/* We have to use !important here because NcButton already has !important */
	transition: opacity ease var(--animation-quick) !important;
}

.header__button:hover,
.header__button:active,
.header__button:focus {
	color: inherit;
	opacity: 1;
}

.spacer {
	flex: 1 0 auto;
}
</style>
