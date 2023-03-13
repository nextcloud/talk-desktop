<!--
  - @copyright Copyright (c) 2023 Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
  -
  - @author Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
  -
  - @license GNU AGPL version 3 or any later version
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
	<NcModal v-bind="$attrs" v-on="$listeners">
		<div class="about">
			<h2>About</h2>
			<p>{{ $options.packageInfo.productName }} - {{ $options.packageInfo.description }}</p>
			<ul class="about__list">
				<li>
					Privacy and Legal Policy: <a class="link" href="https://nextcloud.com/privacy/" target="_blank">https://nextcloud.com/privacy/</a>
				</li>
				<li>
					License: <a class="link" href="https://www.gnu.org/licenses/agpl-3.0.txt" target="_blank">{{ $options.packageInfo.license }}</a>
				</li>
				<li>
					Issues: <a :href="$options.packageInfo.bugs" class="link" target="_blank">{{ $options.packageInfo.bugs }}</a>
				</li>
				<li>
					Source Code: <a :href="$options.packageInfo.repository" class="link" target="_blank">{{ $options.packageInfo.repository }}</a>
				</li>
			</ul>
			<textarea class="about__report"
				:value="report"
				rows="11"
				readonly
				@focus="$event.target.setSelectionRange(0, -1)" />
			<p>This is a Preview version. Drawbacks and issues are in the repository.</p>
		</div>
	</NcModal>
</template>

<script>
import NcModal from '@nextcloud/vue/dist/Components/NcModal.js'
import { appData } from '../../../app/AppData.js'

export default {
	name: 'AboutModal',

	components: { NcModal },
	inheritAttrs: false,

	packageInfo: window.TALK_DESKTOP.packageInfo,

	computed: {
		report() {
			return [
				'----------------------------System report----------------------------',
				`Nextcloud Talk Desktop version ${appData.version.desktop}`,
				`- Built with Nextcloud Talk version ${window.TALK_DESKTOP.version}`,
				'',
				'Connected to:',
				`- Server address: ${appData.serverUrl}`,
				`- Nextcloud Server version ${appData.version.nextcloud.string}`,
				`- Nextcloud Talk version ${appData.version.talk}`,
				'',
				`OS: ${window.OS.version}`,
				'----------------------------System report----------------------------',
			].join('\n')
		},
	},
}
</script>

<style scoped>
.about {
	padding: 15px;
}

.about__list {
	list-style: '-' inside;
}

.about__report {
	width: 100%;
	resize: none;
}

.about .link {
	text-decoration: underline;
}
</style>
