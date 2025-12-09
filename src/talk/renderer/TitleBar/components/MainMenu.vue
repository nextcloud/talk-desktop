<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import type { Ref } from 'vue'

import { t } from '@nextcloud/l10n'
import { generateUrl } from '@nextcloud/router'
import { inject } from 'vue'
import NcActionButton from '@nextcloud/vue/components/NcActionButton'
import NcActionLink from '@nextcloud/vue/components/NcActionLink'
import NcActions from '@nextcloud/vue/components/NcActions'
import NcActionSeparator from '@nextcloud/vue/components/NcActionSeparator'
import IconBugOutline from 'vue-material-design-icons/BugOutline.vue'
import IconCogOutline from 'vue-material-design-icons/CogOutline.vue'
import IconInformationOutline from 'vue-material-design-icons/InformationOutline.vue'
import IconMenu from 'vue-material-design-icons/Menu.vue'
import IconReload from 'vue-material-design-icons/Reload.vue'
import IconWeb from 'vue-material-design-icons/Web.vue'
import { BUILD_CONFIG } from '../../../../shared/build.config.ts'
import { getCurrentTalkRoutePath } from '../../TalkWrapper/talk.service.ts'

const packageInfo = window.TALK_DESKTOP.packageInfo

const isTalkInitialized = inject<Ref<boolean>>('talk:isInitialized')

const showHelp = () => window.TALK_DESKTOP.showHelp()
const reload = () => window.location.reload()
const openSettings = () => window.OCA.Talk.Settings.open()
const openInWeb = () => window.open(generateUrl(getCurrentTalkRoutePath()), '_blank')
</script>

<template>
	<NcActions
		:aria-label="t('talk_desktop', 'Menu')"
		variant="tertiary-no-background"
		container="body">
		<template #icon>
			<IconMenu :size="20" fill-color="var(--color-background-plain-text)" />
		</template>

		<template v-if="isTalkInitialized">
			<NcActionButton @click="openInWeb">
				<template #icon>
					<IconWeb :size="20" />
				</template>
				{{ t('talk_desktop', 'Open in web browser') }}
			</NcActionButton>
		</template>

		<NcActionSeparator />

		<NcActionButton @click="reload">
			<template #icon>
				<IconReload :size="20" />
			</template>
			{{ t('talk_desktop', 'Force reload') }}
		</NcActionButton>
		<NcActionLink v-if="!BUILD_CONFIG.isBranded" :href="packageInfo.bugs.create || packageInfo.bugs.url" target="_blank">
			<template #icon>
				<IconBugOutline :size="20" />
			</template>
			{{ t('talk_desktop', 'Report a bug') }}
		</NcActionLink>

		<NcActionSeparator />

		<NcActionButton close-after-click @click="openSettings">
			<template #icon>
				<IconCogOutline :size="20" />
			</template>
			{{ t('talk_desktop', 'App settings') }}
		</NcActionButton>
		<NcActionButton @click="showHelp">
			<template #icon>
				<IconInformationOutline :size="20" />
			</template>
			{{ t('talk_desktop', 'About') }}
		</NcActionButton>
	</NcActions>
</template>
