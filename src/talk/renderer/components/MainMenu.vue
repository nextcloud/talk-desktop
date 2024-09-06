<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup>
import { computed } from 'vue'

import IconReload from 'vue-material-design-icons/Reload.vue'
import IconWeb from 'vue-material-design-icons/Web.vue'
import IconBug from 'vue-material-design-icons/Bug.vue'
import IconInformationOutline from 'vue-material-design-icons/InformationOutline.vue'
import IconMenu from 'vue-material-design-icons/Menu.vue'

import NcActions from '@nextcloud/vue/dist/Components/NcActions.js'
import NcActionButton from '@nextcloud/vue/dist/Components/NcActionButton.js'
import NcActionLink from '@nextcloud/vue/dist/Components/NcActionLink.js'
import NcActionSeparator from '@nextcloud/vue/dist/Components/NcActionSeparator.js'

import { t } from '@nextcloud/l10n'
import { generateUrl } from '@nextcloud/router'

const packageInfo = window.TALK_DESKTOP.packageInfo
const talkRouter = window.OCA.Talk.Desktop.talkRouter
const talkWebLink = computed(() => generateUrl(talkRouter.value?.currentRoute?.fullPath ?? ''))
const showHelp = () => window.TALK_DESKTOP.showHelp()
const reload = () => window.location.reload()
</script>

<template>
	<NcActions :aria-label="t('talk_desktop', 'Menu')"
		type="tertiary-no-background"
		container="body">
		<template #icon>
			<IconMenu :size="20" fill-color="var(--color-header-contrast)" />
		</template>

		<NcActionLink :href="talkWebLink" target="_blank">
			<template #icon>
				<IconWeb :size="20" />
			</template>
			{{ t('talk_desktop', 'Open in Web-Browser') }}
		</NcActionLink>

		<NcActionSeparator />

		<NcActionButton @click="reload">
			<template #icon>
				<IconReload :size="20" />
			</template>
			{{ t('talk_desktop', 'Force reload') }}
		</NcActionButton>
		<NcActionLink :href="packageInfo.bugs" target="_blank">
			<template #icon>
				<IconBug />
			</template>
			{{ t('talk_desktop', 'Report a bug') }}
		</NcActionLink>

		<NcActionSeparator />

		<NcActionButton @click="showHelp">
			<template #icon>
				<IconInformationOutline :size="20" />
			</template>
			{{ t('talk_desktop', 'About') }}
		</NcActionButton>
	</NcActions>
</template>
