<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { translate as t } from '@nextcloud/l10n'
import { generateUrl } from '@nextcloud/router'

import NcAvatar from '@nextcloud/vue/dist/Components/NcAvatar.js'
import NcPopover from '@nextcloud/vue/dist/Components/NcPopover.js'
import NcUserStatusIcon from '@nextcloud/vue/dist/Components/NcUserStatusIcon.js'

import MdiCheck from 'vue-material-design-icons/Check.vue'
import MdiChevronRight from 'vue-material-design-icons/ChevronRight.vue'
import MdiChevronLeft from 'vue-material-design-icons/ChevronLeft.vue'
import MdiEmoticonOutline from 'vue-material-design-icons/EmoticonOutline.vue'
import MdiPencil from 'vue-material-design-icons/Pencil.vue'
import MdiLogout from 'vue-material-design-icons/Logout.vue'

import ThemeLogo from './ThemeLogo.vue'
import UiMenu from './UiMenu.vue'
import UiMenuItem from './UiMenuItem.vue'
import UiMenuSeparator from './UiMenuSeparator.vue'
import UserStatusDialog from '../UserStatus/UserStatusDialog.vue'
import { useUserStatusStore } from '../UserStatus/userStatus.store.js'
import { userStatusTranslations } from '../UserStatus/userStatus.utils.js'
import { appData } from '../../../app/AppData.js'

const props = defineProps({
	user: {
		type: Object,
		required: true,
	},
})

const emit = defineEmits(['logout'])

const userStatusStore = useUserStatusStore()
const { userStatus } = storeToRefs(userStatusStore)
const serverUrl = appData.serverUrl
const serverUrlShort = serverUrl.replace(/^https?:\/\//, '')
const theming = appData.capabilities.theming

const userMenuContainer = ref(null)
const isUserStatusDialogOpen = ref(false)
const userStatusSubMenuOpen = ref(false)

const userProfileLink = computed(() => generateUrl('/u/{userid}', { userid: props.user.id }))

/**
 * Handle user status type change
 * @param {string} status - new user status
 */
function handleUserStatusChange(status) {
	userStatusStore.saveUserStatus({ ...userStatus.value, status })
	userStatusSubMenuOpen.value = false
}
</script>

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
						:size="32"
						disable-tooltip
						tabindex="0" />
				</button>
			</template>

			<template #default>
				<UiMenu aria-label="Settings menu">
					<template v-if="userStatusSubMenuOpen">
						<UiMenuItem tag="button" @click.native.stop="userStatusSubMenuOpen = false">
							<template #icon>
								<MdiChevronLeft :size="20" />
							</template>
							{{ t('talk_desktop', 'Back') }}
						</UiMenuItem>
						<UiMenuItem v-for="status in ['online', 'away', 'dnd', 'invisible']"
							:key="status"
							tag="button"
							@click.native.stop="handleUserStatusChange(status)">
							<template #icon>
								<NcUserStatusIcon :status="status" />
							</template>
							{{ userStatusTranslations[status] }}
							<template v-if="status === userStatus.status" #action-icon>
								<MdiCheck :size="20" />
							</template>
						</UiMenuItem>
					</template>

					<template v-else>
						<UiMenuItem tag="a"
							:href="userProfileLink"
							target="_blank">
							<strong>{{ user['display-name'] }}</strong>
							<div>
								{{ t('talk_desktop', 'View profile') }}
							</div>
						</UiMenuItem>

						<UiMenuSeparator />

						<UiMenuItem tag="a" :href="serverUrl" target="_blank">
							<template #icon>
								<ThemeLogo :size="24" />
							</template>
							<span class="user-menu__server">
								<span>{{ theming.name }}</span>
								<em>{{ serverUrlShort }}</em>
							</span>
						</UiMenuItem>

						<UiMenuSeparator />

						<template v-if="userStatus">
							<UiMenuItem tag="button" @click.native.stop="userStatusSubMenuOpen = true">
								<template #icon>
									<NcUserStatusIcon :status="userStatus.status" />
								</template>
								{{ userStatusTranslations[userStatus.status] }}
								<template #action-icon>
									<MdiChevronRight :size="20" />
								</template>
							</UiMenuItem>
							<UiMenuItem key="custom-status" tag="button" @click.native="isUserStatusDialogOpen = true">
								<template #icon>
									<span v-if="userStatus.icon" style="font-size: 20px">
										{{ userStatus.icon }}
									</span>
									<MdiEmoticonOutline v-else :size="20" />
								</template>
								{{ userStatus.message || t('talk_desktop', 'Set custom status') }}
								<template v-if="userStatus.message" #action-icon>
									<MdiPencil :size="20" />
								</template>
							</UiMenuItem>

							<UiMenuSeparator />
						</template>

						<UiMenuItem tag="button" @click.native="emit('logout')">
							<template #icon>
								<MdiLogout :size="20" />
							</template>
							{{ t('talk_desktop', 'Log out') }}
						</UiMenuItem>
					</template>
				</UiMenu>
			</template>
		</NcPopover>

		<UserStatusDialog v-if="isUserStatusDialogOpen" @close="isUserStatusDialogOpen = false" />
	</div>
</template>

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

.user-menu__server {
	display: flex;
	flex-direction: column;
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
