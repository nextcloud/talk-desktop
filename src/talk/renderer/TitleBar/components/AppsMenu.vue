<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import axios from '@nextcloud/axios'
import { t } from '@nextcloud/l10n'
import { generateOcsUrl } from '@nextcloud/router'
import { onBeforeMount, ref } from 'vue'
import NcActionLink from '@nextcloud/vue/components/NcActionLink'
import NcActions from '@nextcloud/vue/components/NcActions'
import IconDotsGrid from 'vue-material-design-icons/DotsGrid.vue'
import ThemeLogo from './ThemeLogo.vue'
import { appData } from '../../../../app/AppData.js'

const apps = ref([])
const serverUrl = appData.serverUrl! as string
const theming = appData.capabilities.theming

// TODO: add it to the Application Data
// TODO: add types
onBeforeMount(async () => {
	const response = await axios.get(generateOcsUrl('core/navigation/apps'))
	apps.value = response.data.ocs.data.filter(({ id }) => id !== 'spreed')
})
</script>

<template>
	<NcActions :aria-label="t('talk_desktop', 'Menu')" variant="tertiary-no-background" force-menu>
		<template #icon>
			<IconDotsGrid :size="20" />
		</template>

		<NcActionLink :href="serverUrl">
			<template #icon>
				<span class="action-icon-wrapper">
					<ThemeLogo :size="20" />
				</span>
			</template>
			{{ theming.name }}
		</NcActionLink>
		<NcActionLink v-for="app in apps" :key="app.id" :href="app.href">
			<template #icon>
				<span class="action-icon-wrapper">
					<img class="app-icon" :src="app.icon" alt="">
				</span>
			</template>
			{{ app.name }}
		</NcActionLink>
	</NcActions>
</template>

<style scoped>
.action-icon-wrapper {
	width: var(--default-clickable-area);
	height: var(--default-clickable-area);
	display: flex;
	align-items: center;
	justify-content: center;
}

.app-icon {
	max-width: 20px;
	max-height: 20px;
	filter: var(--background-invert-if-bright);
}
</style>
