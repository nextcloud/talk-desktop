<!--
  - @copyright Copyright (c) 2023 Grigorii Shartsev <me@shgk.me>
  -
  - @author Grigorii Shartsev <me@shgk.me>
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
	<div class="media-wrapper">
		<video :src="src" controls />
	</div>
</template>

<script>
import { generateRemoteUrl } from '@nextcloud/router'
import { getCurrentUser } from '@nextcloud/auth'

export default {
	name: 'ViewerHandlerVideos',

	props: {
		file: {
			type: Object,
			required: true,
		},
	},

	computed: {
		src() {
			if (!this.file) {
				return null
			}

			return generateRemoteUrl(`dav/files/${getCurrentUser().uid}/${this.file.filename}`)
		},
	},
}
</script>

<style scoped>
.media-wrapper {
	display: flex;
	height: 100%;
	width: 100%;
	justify-content: center;
	align-items: center;

	> * {
		max-width: 100%;
		max-height: 100%;
	}
}
</style>
