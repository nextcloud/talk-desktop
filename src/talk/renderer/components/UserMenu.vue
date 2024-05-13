<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div ref="userMenuContainer" class="user-menu">
		<NcPopover v-if="userMenuContainer" :container="userMenuContainer" :popper-hide-triggers="triggers => [...triggers, 'click']">
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
				<UiMenu aria-label="Settings menu">
					<UiMenuItem tag="a" :href="userProfileLink" target="_blank">
						<div><strong>{{ user['display-name'] }}</strong></div>
						<div>{{ t('talk_desktop', 'View profile') }}</div>
					</UiMenuItem>
					<UiMenuItem v-if="userStatusStore.userStatus" tag="button" @click.native="isUserStatusDialogOpen = true">
						<template #icon>
							<NcUserStatusIcon :status="userStatusStore.userStatus.status" />
						</template>
						<template #default>
							{{ visibleUserStatus }}
						</template>
					</UiMenuItem>
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
import MdiInformationOutline from 'vue-material-design-icons/InformationOutline.vue'
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
import { getVisibleUserStatus } from '../UserStatus/userStatus.utils.js'

export default {
	name: 'UserMenu',

	packageInfo: window.TALK_DESKTOP.packageInfo,

	components: {
		UserStatusDialog,
		UiMenuItem,
		UiMenu,
		MdiBug,
		MdiInformationOutline,
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
		return {
			userStatusStore,
		}
	},

	data() {
		return {
			userMenuContainer: null,
			isUserStatusDialogOpen: false,
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
