<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import type { Ref } from 'vue'
import { inject } from 'vue'
import IconCog from 'vue-material-design-icons/Cog.vue'
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
import { getCurrentTalkRoutePath } from '../../TalkWrapper/talk.service.ts'

const packageInfo = window.TALK_DESKTOP.packageInfo

const isTalkInitialized = inject<Ref<boolean>>('talk:isInitialized')

const showHelp = () => window.TALK_DESKTOP.showHelp()
const reload = () => window.location.reload()
const openSettings = () => window.OCA.Talk.Settings.open()
const openInWeb = () => window.open(generateUrl(getCurrentTalkRoutePath()), '_blank')
</script>

<template>
	<NcActions :aria-label="t('talk_desktop', 'Menu')"
		type="tertiary-no-background"
		container="body">
		<template #icon>
			<IconMenu :size="20" fill-color="var(--color-header-contrast)" />
		</template>

		<template v-if="isTalkInitialized">
			<NcActionButton @click="openInWeb">
				<template #icon>
					<IconWeb :size="20" />
				</template>
				{{ t('talk_desktop', 'Open in Web-Browser') }}
			</NcActionButton>
		</template>

		<NcActionSeparator />

		<NcActionButton @click="reload">
			<template #icon>
				<IconReload :size="20" />
			</template>
			{{ t('talk_desktop', 'Force reload') }}
		</NcActionButton>
		<NcActionLink :href="packageInfo.bugs.create || packageInfo.bugs.url" target="_blank">
			<template #icon>
				<IconBug />
			</template>
			{{ t('talk_desktop', 'Report a bug') }}
		</NcActionLink>

		<NcActionSeparator />

		<NcActionButton close-after-click @click="openSettings">
			<template #icon>
				<IconCog :size="20" />
			</template>
			{{ t('talk_desktop', 'Settings') }}
		</NcActionButton>
		<NcActionButton @click="showHelp">
			<template #icon>
				<IconInformationOutline :size="20" />
			</template>
			{{ t('talk_desktop', 'About') }}
		</NcActionButton>
	</NcActions>
</template>
