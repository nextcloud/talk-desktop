<!--
  - @copyright Copyright (c) 2023 Maksim Sukharev <antreesy.web@gmail.com>
  -
  - @license AGPL-3.0-or-later
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
	<div class="upgrade">
		<h2>{{ t('talk_desktop', 'Upgrade required') }}</h2>
		<p>{{ t('talk_desktop', 'The client version is too old and no longer supported by this server. Update is required.') }}</p>
		<NcButton type="primary"
			wide
			:href="$options.packageInfo.repository"
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

<script>
import MdiUpdate from 'vue-material-design-icons/Update.vue'
import MdiWeb from 'vue-material-design-icons/Web.vue'
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import { translate as t } from '@nextcloud/l10n'
import { generateUrl } from '@nextcloud/router'

export default {
	name: 'UpgradeApp',

	components: {
		MdiUpdate,
		MdiWeb,
		NcButton,
	},

	packageInfo: window.TALK_DESKTOP.packageInfo,

	computed: {
		browserLink() {
			return generateUrl('apps/spreed')
		},
	},

	methods: {
		t,
	},
}
</script>

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
