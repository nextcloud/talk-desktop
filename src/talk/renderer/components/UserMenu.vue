<!--
  - @copyright Copyright (c) 2023 Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
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
	<div ref="userMenuContainer" class="user-menu">
		<NcPopover v-if="userMenuContainer"
			:container="userMenuContainer"
			:popper-hide-triggers="triggers => [...triggers, 'click']"
			no-auto-focus>
			<template #trigger="{ attrs }">
				<button class="user-menu__trigger unstyled-button" v-bind="attrs">
					<NcAvatar class="user-menu__avatar"
						:user="user.id"
						:display-name="user['display-name']"
						disable-tooltip
						tabindex="0" />
				</button>
			</template>

			<template #default>
				<UiMenu ref="userMenuElement" aria-label="Settings menu">
					<UiMenuItem tag="a"
						:href="userProfileLink"
						target="_blank">
						<div><strong>{{ user['display-name'] }}</strong></div>
						<div>{{ t('talk_desktop', 'View profile') }}</div>
					</UiMenuItem>
					<UiMenuSeparator />
					<UiMenuItem tag="button" @click.native.stop="userStatusSubMenuOpen = !userStatusSubMenuOpen">
						<template #icon>
							<NcUserStatusIcon :status="userStatusStore.userStatus.status" />
						</template>
						<span style="display: flex">
							<span>
								{{ userStatusTranslations[userStatusStore.userStatus.status] }}
							</span>
							<span style="margin-left: auto">
								<MdiChevronUp v-if="userStatusSubMenuOpen" :size="20" />
								<MdiChevronDown v-else :size="20" />
							</span>
						</span>
					</UiMenuItem>
					<li v-if="userStatusSubMenuOpen">
						<ul>
							<UiMenuItem v-for="status in ['online', 'away', 'dnd', 'invisible']"
								:key="status"
								tag="button"
								@click.native.stop="handleUserStatusChange(status)">
								<template #icon>
									<NcUserStatusIcon :status="status" />
								</template>
								<span style="display: flex">
									<span>
										{{ userStatusTranslations[status] }}
									</span>
									<span v-if="status === userStatusStore.userStatus.status" style="margin-left: auto">
										<MdiCheck :size="20" />
									</span>
								</span>
							</UiMenuItem>
						</ul>
					</li>
					<UiMenuSeparator />
					<UiMenuItem key="custom-status" tag="button" @click.native="isUserStatusDialogOpen = true">
						<template #icon>
							<span v-if="userStatusStore.userStatus.icon" style="font-size: 20px">
								{{ userStatusStore.userStatus.icon }}
							</span>
							<MdiEmoticonOutline v-else :size="20" />
						</template>
						<template v-if="userStatusStore.userStatus.message">
							<span style="display: flex">
								<span>
									{{ userStatusStore.userStatus.message }}
								</span>
								<span style="margin-left: auto">
									<MdiPencil :size="20" />
								</span>
							</span>
						</template>
						<template v-else>
							<span style="display: flex">
								<span>
									{{ t('talk_desktop', 'Set custom status') }}
								</span>
								<span style="margin-left: auto">
									<MdiChevronRight :size="20" />
								</span>
							</span>
						</template>
					</UiMenuItem>
					<UiMenuSeparator />
					<UiMenuItem tag="button" @click.native="reload">
						<template #icon>
							<MdiReload />
						</template>
						{{ t('talk_desktop', 'Force reload') }}
					</UiMenuItem>
					<UiMenuItem tag="a" :href="$options.packageInfo.bugs" target="_blank">
						<template #icon>
							<MdiBug />
						</template>
						{{ t('talk_desktop', 'Report a bug') }}
					</UiMenuItem>
					<UiMenuSeparator />
					<UiMenuItem tag="a" :href="talkWebLink" target="_blank">
						<template #icon>
							<MdiWeb />
						</template>
						<template #default>
							{{ t('talk_desktop', 'Open in Web-Browser') }}
						</template>
					</UiMenuItem>
					<UiMenuItem tag="button" @click.native="showHelp">
						<template #icon>
							<MdiInformationOutline />
						</template>
						<template #default>
							{{ t('talk_desktop', 'About') }}
						</template>
					</UiMenuItem>
					<UiMenuItem tag="button" @click.native="$emit('logout')">
						<template #icon>
							<MdiPower />
						</template>
						<template #default>
							{{ t('talk_desktop', 'Log out') }}
						</template>
					</UiMenuItem>
				</UiMenu>
			</template>
		</NcPopover>

		<UserStatusDialog v-if="isUserStatusDialogOpen" @close="isUserStatusDialogOpen = false" />
	</div>
</template>

<script>
import MdiBug from 'vue-material-design-icons/Bug.vue'
import MdiCheck from 'vue-material-design-icons/Check.vue'
import MdiChevronDown from 'vue-material-design-icons/ChevronDown.vue'
import MdiChevronUp from 'vue-material-design-icons/ChevronUp.vue'
import MdiChevronRight from 'vue-material-design-icons/ChevronRight.vue'
import MdiEmoticonOutline from 'vue-material-design-icons/EmoticonOutline.vue'
import MdiInformationOutline from 'vue-material-design-icons/InformationOutline.vue'
import MdiPencil from 'vue-material-design-icons/Pencil.vue'
import MdiPower from 'vue-material-design-icons/Power.vue'
import MdiReload from 'vue-material-design-icons/Reload.vue'
import MdiWeb from 'vue-material-design-icons/Web.vue'
import { generateUrl } from '@nextcloud/router'
import { translate as t } from '@nextcloud/l10n'
import NcAvatar from '@nextcloud/vue/dist/Components/NcAvatar.js'
import NcPopover from '@nextcloud/vue/dist/Components/NcPopover.js'
import NcUserStatusIcon from '@nextcloud/vue/dist/Components/NcUserStatusIcon.js'
import UiMenu from './UiMenu.vue'
import UiMenuItem from './UiMenuItem.vue'
import { useUserStatusStore } from '../UserStatus/userStatus.store.js'
import UserStatusDialog from '../UserStatus/UserStatusDialog.vue'
import { getVisibleUserStatus, userStatusTranslations } from '../UserStatus/userStatus.utils.js'
import UiMenuSeparator from './UiMenuSeparator.vue'
import { ref } from 'vue'

export default {
	name: 'UserMenu',

	packageInfo: window.TALK_DESKTOP.packageInfo,

	components: {
		UiMenuSeparator,
		UserStatusDialog,
		UiMenuItem,
		UiMenu,
		MdiBug,
		MdiCheck,
		MdiChevronDown,
		MdiChevronUp,
		MdiChevronRight,
		MdiEmoticonOutline,
		MdiInformationOutline,
		MdiPencil,
		MdiPower,
		MdiReload,
		MdiWeb,
		NcAvatar,
		NcPopover,
		NcUserStatusIcon,
	},

	props: {
		user: {
			type: Object,
			required: true,
		},
	},

	emits: ['logout'],

	setup() {
		const userStatusStore = useUserStatusStore()
		const userMenuElement = ref(null)
		return {
			userStatusStore,
			userStatusTranslations,
			userMenuElement,
		}
	},

	data() {
		return {
			userMenuContainer: null,
			isUserStatusDialogOpen: false,
			userStatusSubMenuOpen: false,
		}
	},

	computed: {
		userProfileLink() {
			return generateUrl('/u/{userid}', { userid: this.user.id })
		},

		talkWebLink() {
			return generateUrl('/apps/spreed')
		},

		visibleUserStatus() {
			return getVisibleUserStatus(this.userStatusStore.userStatus)
		},
	},

	mounted() {
		this.userMenuContainer = this.$refs.userMenuContainer
	},

	methods: {
		t,

		showHelp() {
			window.TALK_DESKTOP.showHelp()
		},

		reload() {
			window.location.reload()
		},

		handleUserStatusChange(status) {
			this.userStatusStore.saveUserStatus({ ...this.userStatusStore.userStatus, status })
			this.userStatusSubMenuOpen = false
		},
	},
}
</script>

<style scoped>
.unstyled-button {
	cursor: pointer;
}

.unstyled-button,
.unstyled-button:active,
.unstyled-button:hover,
.unstyled-button:focus {
	background: unset;
	border: none;
	padding: 0;
	margin: 0;
}

/*
	NcPopover is a wrapper around Dropdown from floating-vue.
  But any NcPopover component added to the web-pages globally changes default floating-vue styles.

  - It is impossible to changes styles of inner block with NcPopover component (no props for that)
  - It is impossible to use default Dropdown from floating-vue (styles are overrided globally)

  So, let's re-override these styles...
  Better options:
  - Fix NcPopover
  - Create a new Dropdown using renderless components from floating-vue
*/
.user-menu :deep(.v-popper--theme-dropdown.v-popper__popper) {
	margin: -2px 5px 0 0;
}

.user-menu :deep(.v-popper--theme-dropdown.v-popper__popper .v-popper__inner) {
	border-radius: var(--border-radius-large);
}

.user-menu__trigger {
	display: flex;
	align-items: center;
	margin: 0 !important; /* Re-define server default styles */
}

.user-menu__avatar {
	box-sizing: content-box;
}

.user-menu__trigger:hover .user-menu__avatar,
.user-menu__trigger:active .user-menu__avatar,
.user-menu__trigger:focus .user-menu__avatar {
	border: 2px solid var(--color-primary-text)
}

.user-menu__wrapper {
	/*margin: 0 4px;*/
	padding: 8px;
	/*background-color: var(--color-main-background);*/
	/*border-radius: var(--border-radius-large);*/
	/*box-shadow: 0 1px 5px var(--color-box-shadow);*/
}
</style>
