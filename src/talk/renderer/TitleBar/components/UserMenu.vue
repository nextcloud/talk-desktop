<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import type { UserStatusStatusType } from '../../UserStatus/userStatus.types.ts'
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { t } from '@nextcloud/l10n'
import { generateUrl } from '@nextcloud/router'
import NcAvatar from '@nextcloud/vue/components/NcAvatar'
import NcPopover from '@nextcloud/vue/components/NcPopover'
import NcUserStatusIcon from '@nextcloud/vue/components/NcUserStatusIcon'
import IconCheck from 'vue-material-design-icons/Check.vue'
import IconChevronRight from 'vue-material-design-icons/ChevronRight.vue'
import IconChevronLeft from 'vue-material-design-icons/ChevronLeft.vue'
import IconEmoticonOutline from 'vue-material-design-icons/EmoticonOutline.vue'
import IconPencil from 'vue-material-design-icons/Pencil.vue'
import IconLogout from 'vue-material-design-icons/Logout.vue'
import ThemeLogo from './ThemeLogo.vue'
import UiMenu from './UiMenu.vue'
import UiMenuItem from './UiMenuItem.vue'
import UiMenuSeparator from './UiMenuSeparator.vue'
import UserStatusDialog from '../../UserStatus/UserStatusDialog.vue'
import { useUserStatusStore } from '../../UserStatus/userStatus.store.ts'
import { userStatusTranslations, availableUserStatusStatusTypes } from '../../UserStatus/userStatus.utils.ts'
import { appData } from '../../../../app/AppData.js'

const props = defineProps<{
	// TODO: define a proper type for userMetadata
	user: { id: string; 'display-name': string }
}>()

const emit = defineEmits<{
	(event: 'logout'): void
}>()

const userStatusStore = useUserStatusStore()
const { userStatus } = storeToRefs(userStatusStore)
const serverUrl = appData.serverUrl! as string
const serverUrlShort = serverUrl.replace(/^https?:\/\//, '')
const theming = appData.capabilities.theming

const isOpen = ref(false)
const userMenuContainer = ref<HTMLElement | null>(null)
const isUserStatusDialogOpen = ref(false)
const userStatusSubMenuOpen = ref(false)

// Close the submenu before opening the menu
watch(isOpen, () => {
	if (isOpen.value) {
		userStatusSubMenuOpen.value = false
	}
})

const userProfileLink = computed(() => generateUrl('/u/{userid}', { userid: props.user.id }))

// Vue 2 doesn't allow using types in templates
// TODO: Vue 3: return back to template
const popoverHideTriggers = (triggers: string[]) => [...triggers, 'click']

/**
 * Handle user status type change
 * @param status - new user status
 */
function handleUserStatusChange(status: UserStatusStatusType) {
	userStatusStore.saveUserStatus({ ...userStatus.value!, status })
	userStatusSubMenuOpen.value = false
}
</script>

<template>
	<div ref="userMenuContainer" class="user-menu">
		<NcPopover v-if="userMenuContainer"
			:shown.sync="isOpen"
			:container="userMenuContainer"
			:popper-hide-triggers="popoverHideTriggers"
			:triggers="[]"
			no-auto-focus>
			<template #trigger="{ attrs }">
				<div class="user-menu__trigger">
					<!-- Floating-Vue doesn't support open on span[role=button] - opening manually -->
					<NcAvatar class="user-menu__avatar"
						:user="user.id"
						:display-name="user['display-name']"
						:size="32"
						disable-tooltip
						v-bind="attrs"
						tabindex="0"
						role="button"
						@click.native="isOpen = !isOpen"
						@keydown.space.native="isOpen = !isOpen"
						@keydown.enter.native="isOpen = !isOpen" />
				</div>
			</template>

			<template #default>
				<UiMenu aria-label="Settings menu" class="user-menu__menu">
					<template v-if="userStatusSubMenuOpen">
						<UiMenuItem tag="button" @click.native.stop="userStatusSubMenuOpen = false">
							<template #icon>
								<IconChevronLeft :size="20" />
							</template>
							{{ t('talk_desktop', 'Back') }}
						</UiMenuItem>
						<UiMenuItem v-for="status in availableUserStatusStatusTypes"
							:key="status"
							tag="button"
							@click.native.stop="handleUserStatusChange(status)">
							<template #icon>
								<NcUserStatusIcon :status="status" />
							</template>
							{{ userStatusTranslations[status] }}
							<!-- @vue-expect-error This menu can only be open from a button with v-if="userStatus", but in Vue 2 we cannot add type assertion -->
							<template v-if="status === userStatus.status" #action-icon>
								<IconCheck :size="20" />
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
									<IconChevronRight :size="20" />
								</template>
							</UiMenuItem>
							<UiMenuItem key="custom-status" tag="button" @click.native="isUserStatusDialogOpen = true">
								<template #icon>
									<span v-if="userStatus.icon" style="font-size: 20px">
										{{ userStatus.icon }}
									</span>
									<IconEmoticonOutline v-else :size="20" />
								</template>
								{{ userStatus.message || t('talk_desktop', 'Set custom status') }}
								<template v-if="userStatus.message" #action-icon>
									<IconPencil :size="20" />
								</template>
							</UiMenuItem>

							<UiMenuSeparator />
						</template>

						<UiMenuItem tag="button" @click.native="emit('logout')">
							<template #icon>
								<IconLogout :size="20" />
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

.user-menu :deep(.v-popper--theme-dropdown.v-popper__popper .v-popper__inner) {
	border-radius: var(--border-radius-large);
}

.user-menu__trigger {
	display: flex;
	align-items: center;
}

.user-menu__avatar {
	box-sizing: content-box;
}

.user-menu__trigger:hover,
.user-menu__trigger:active,
.user-menu__trigger:focus,
.user-menu__trigger:focus-visible {
	.user-menu__avatar {
		outline: 2px solid var(--color-main-text);
		box-shadow: 0 0 0 4px var(--color-main-background);
	}
}

.user-menu__menu {
	max-width: 300px;
}

.user-menu__server {
	display: flex;
	flex-direction: column;
}
</style>
