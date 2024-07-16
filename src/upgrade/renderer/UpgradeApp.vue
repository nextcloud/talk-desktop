<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup>
import MdiUpdate from 'vue-material-design-icons/Update.vue'
import MdiWeb from 'vue-material-design-icons/Web.vue'
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import { translate as t } from '@nextcloud/l10n'
import { generateUrl } from '@nextcloud/router'

const packageInfo = window.TALK_DESKTOP.packageInfo

const browserLink = generateUrl('apps/spreed')
</script>

<template>
	<div class="upgrade">
		<h2>{{ t('talk_desktop', 'Upgrade required') }}</h2>
		<p>{{ t('talk_desktop', 'The client version is too old and no longer supported by this server. Update is required.') }}</p>
		<NcButton type="primary"
			wide
			:href="packageInfo.repository"
			target="_blank">
			<template #icon>
				<MdiUpdate />
			</template>
			{{ t('talk_desktop', 'Update Talk Desktop ↗') }}
		</NcButton>
		<NcButton type="secondary"
			wide
			:href="browserLink">
			<template #icon>
				<MdiWeb />
			</template>
			{{ t('talk_desktop', 'Continue in Web-Browser ↗') }}
		</NcButton>
	</div>
</template>

<style scoped>
.upgrade {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
	height: 100%;
	background: var(--color-main-background);
	padding: 15px;
}

.upgrade h2,
.upgrade p {
	user-select: none;
}
</style>
