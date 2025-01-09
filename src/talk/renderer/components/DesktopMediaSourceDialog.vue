<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import IconCancel from '@mdi/svg/svg/cancel.svg?raw'
import IconMonitorShare from '@mdi/svg/svg/monitor-share.svg?raw'

import NcDialog from '@nextcloud/vue/dist/Components/NcDialog.js'
import NcEmptyContent from '@nextcloud/vue/dist/Components/NcEmptyContent.js'
import NcLoadingIcon from '@nextcloud/vue/dist/Components/NcLoadingIcon.js'

import { translate as t } from '@nextcloud/l10n'
import DesktopMediaSourcePreview from './DesktopMediaSourcePreview.vue'

const emit = defineEmits(['submit', 'cancel'])

const RE_REQUEST_SOURCES_TIMEOUT = 1000

// On Wayland getting each stream for the live preview requests user to select the source via system dialog again
// Instead - show static images.
// See: https://github.com/electron/electron/issues/27732
const previewType = window.systemInfo.isWayland ? 'thumbnail' : 'live'

const selectedSourceId = ref(null)
const sources = ref(null)

const handleSubmit = () => emit('submit', selectedSourceId.value)
const handleCancel = () => emit('cancel')

const dialogButtons = computed(() => [
	{
		label: t('talk_desktop', 'Cancel'),
		icon: IconCancel,
		callback: handleCancel,
	},
	{
		label: t('talk_desktop', 'Share screen'),
		type: 'primary',
		icon: IconMonitorShare,
		disabled: !selectedSourceId.value,
		callback: handleSubmit,
	},
])

const requestDesktopCapturerSources = async () => {
	sources.value = await window.TALK_DESKTOP.getDesktopCapturerSources()

	// There is no source. Probably the user hasn't granted the permission.
	if (!sources.value) {
		emit('cancel')
	}

	// On Wayland there might be no name from the desktopCapturer
	if (window.systemInfo.isWayland) {
		for (const source of sources.value) {
			source.name ||= t('talk_desktop', 'Selected screen or window')
		}
	}

	// Separate sources to combine them then to [screens, desktop, windows]
	const screens = sources.value.filter((source) => source.id.startsWith('screen:'))
	const windows = sources.value.filter((source) => source.id.startsWith('window:'))

	// There is no sourceId for the entire desktop with all the screens and audio in Electron.
	// But it is possible to capture it. "entire-desktop:0:0" is a custom sourceId for this specific case.
	const entireDesktop = {
		id: 'entire-desktop:0:0',
		name: screens.length > 1 ? t('talk_desktop', 'Audio + All screens') : t('talk_desktop', 'Audio + Screen'),
	}

	// Wayland uses the system picker via PipeWire to select the source.
	// Thus, only the selected source is available, and the custom entire-desktop option is neither supported nor needed.
	// On macOS the entire-desktop captures only the primary screen and capturing system audio crashes audio (microphone).
	// TODO: use the system picker on macOS Sonoma and later
	sources.value = window.systemInfo.isWayland || window.systemInfo.isMac ? [...screens, ...windows] : [...screens, entireDesktop, ...windows]
}

const handleVideoSuspend = (source) => {
	sources.value.splice(sources.value.indexOf(source), 1)
	if (selectedSourceId.value === source.id) {
		selectedSourceId.value = null
	}
}

let reRequestTimeout

const scheduleRequestDesktopCaprutererSources = () => {
	reRequestTimeout = setTimeout(async () => {
		await requestDesktopCapturerSources()
		scheduleRequestDesktopCaprutererSources()
	}, RE_REQUEST_SOURCES_TIMEOUT)
}

onMounted(async () => {
	await requestDesktopCapturerSources()

	// Preselect the first media source if any
	if (!selectedSourceId.value) {
		selectedSourceId.value = sources.value[0]?.id
	}

	if (previewType === 'live') {
		scheduleRequestDesktopCaprutererSources()
	}
})

onBeforeUnmount(() => {
	if (reRequestTimeout) {
		clearTimeout(reRequestTimeout)
	}
})
</script>

<template>
	<NcDialog :name="t('talk_desktop', 'Choose what to share')"
		size="normal"
		:buttons="dialogButtons"
		@update:open="handleCancel">
		<div v-if="sources" class="capture-source-grid">
			<DesktopMediaSourcePreview v-for="source in sources"
				:key="source.id"
				:source="source"
				:selected="selectedSourceId === source.id"
				@select="selectedSourceId = source.id"
				@suspend="handleVideoSuspend(source)" />
		</div>
		<NcEmptyContent v-else :name="t('talk_desktop', 'Loading …')">
			<template #icon>
				<NcLoadingIcon />
			</template>
		</NcEmptyContent>
	</NcDialog>
</template>

<style scoped lang="scss">
.capture-source-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	grid-gap: calc(var(--default-grid-baseline) * 2);
	width: 100%;
}
</style>
