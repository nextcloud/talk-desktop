<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { t } from '@nextcloud/l10n'
import { generateUrl } from '@nextcloud/router'
import NcButton from '@nextcloud/vue/components/NcButton'
import IconCloudDownloadOutline from 'vue-material-design-icons/CloudDownloadOutline.vue'
import IconWeb from 'vue-material-design-icons/Web.vue'
import AppWindow from '../../shared/components/AppWindow.vue'

const packageInfo = window.TALK_DESKTOP.packageInfo

const browserLink = generateUrl('/apps/spreed')
</script>

<template>
	<AppWindow :title="t('talk_desktop', 'Upgrade required')" class="upgrade">
		<div class="upgrade__content">
			<h2 class="upgrade__heading">
				{{ t('talk_desktop', 'Upgrade required') }}
			</h2>
			<p class="upgrade__text">
				{{ t('talk_desktop', 'The client version is too old and no longer supported by this server. Update is required.') }}
			</p>
		</div>
		<div class="upgrade__actions">
			<NcButton
				:href="packageInfo.repository"
				target="_blank"
				variant="primary"
				wide>
				<template #icon>
					<IconCloudDownloadOutline :size="20" />
				</template>
				{{ t('talk_desktop', 'Update Talk Desktop') }} ↗
			</NcButton>
			<NcButton
				:href="browserLink"
				variant="secondary"
				target="_blank"
				wide>
				<template #icon>
					<IconWeb :size="20" />
				</template>
				{{ t('talk_desktop', 'Continue in web browser') }} ↗
			</NcButton>
		</div>
	</AppWindow>
</template>

<style scoped>
.upgrade {
	--upgrade-spacing: calc(2 * var(--default-grid-baseline));
	display: flex;
	flex-direction: column;
	align-items: stretch;
	text-align: center;
	gap: var(--upgrade-spacing);
	background: var(--color-main-background);
	padding: var(--upgrade-spacing);
	user-select: none;
}

.upgrade__content {
	display: flex;
	flex-direction: column;
	justify-content: space-evenly;
	gap: var(--upgrade-spacing);
	flex: 1;
}

.upgrade__actions {
	display: flex;
	flex-direction: column;
	gap: var(--upgrade-spacing);
}

.upgrade__heading {
	margin-block: 0;
	font-size: 1.5em;
	text-align: center;
}

.upgrade__text {
	color: var(--color-text-maxcontrast);
}
</style>
