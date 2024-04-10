<!--
  - @copyright Copyright (c) 2024 Grigorii Shartsev <me@shgk.me>
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

<script setup>
import { ref } from 'vue'

import DesktopMediaSourceDialog from './components/DesktopMediaSourceDialog.vue'

const showDialog = ref(false)

let promiseWithResolvers = null

const handlePrompt = (sourceId) => {
	promiseWithResolvers.resolve({ sourceId })
	promiseWithResolvers = null
	showDialog.value = false
}

/**
 * Prompt user to select a desktop media source to share and return the selected sourceId or an empty string if canceled
 *
 * @return {Promise<{ sourceId: string }>} sourceId of the selected mediaSource or an empty string if canceled
 */
function promptDesktopMediaSource() {
	if (promiseWithResolvers) {
		return promiseWithResolvers.promise
	}
	showDialog.value = true
	promiseWithResolvers = Promise.withResolvers()
	return promiseWithResolvers.promise
}

defineExpose({ promptDesktopMediaSource })
</script>

<template>
	<DesktopMediaSourceDialog v-if="showDialog" @submit="handlePrompt($event)" @cancel="handlePrompt('')" />
</template>
