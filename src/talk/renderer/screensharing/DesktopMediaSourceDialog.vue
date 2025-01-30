<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { ScreensharingSource, ScreensharingSourceId } from './screensharing.types.ts'
import { computed, ref, watch } from 'vue'
import IconCancel from '@mdi/svg/svg/cancel.svg?raw'
import IconMonitorShare from '@mdi/svg/svg/monitor-share.svg?raw'
import NcDialog from '@nextcloud/vue/dist/Components/NcDialog.js'
import NcEmptyContent from '@nextcloud/vue/dist/Components/NcEmptyContent.js'
import NcLoadingIcon from '@nextcloud/vue/dist/Components/NcLoadingIcon.js'
import { t } from '@nextcloud/l10n'
import { useWindowFocus } from '@vueuse/core'
import DesktopMediaSourcePreview from './DesktopMediaSourcePreview.vue'

const emit = defineEmits<{
	(event: 'submit', sourceId: ScreensharingSourceId): void
	(event: 'cancel'): void
}>()

const selectedSourceId = ref<ScreensharingSourceId | null>(null)
const sources = ref<ScreensharingSource[] | null>(null)

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

// On Wayland instead of the list of all available sources,
// the system picker is used to have a list of a single selected source.
// Getting the stream for the selected source triggers the system picker again.
// As a result:
// - Live preview is not possible
// - Sources list update is not possible
// - There is no the entire-desktop option
// See also: https://github.com/electron/electron/issues/27732
if (!window.systemInfo.isWayland) {
	const isWindowFocused = useWindowFocus()
	watch(isWindowFocused, requestDesktopCapturerSources)
}

requestDesktopCapturerSources()

/**
 * Request the desktop capturer sources
 */
async function requestDesktopCapturerSources() {
	sources.value = await window.TALK_DESKTOP.getDesktopCapturerSources() as ScreensharingSource[] | null

	// There is no source. Probably the user hasn't granted the permission.
	if (!sources.value) {
		emit('cancel')
		return
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
	const entireDesktop: ScreensharingSource = {
		id: 'entire-desktop:0:0',
		name: screens.length > 1 ? t('talk_desktop', 'Audio + All screens') : t('talk_desktop', 'Audio + Screen'),
		icon: null,
		thumbnail: null,
	}

	// Wayland uses the system picker via PipeWire to select the source.
	// Thus, only the selected source is available, and the custom entire-desktop option is neither supported nor needed.
	// On macOS the entire-desktop captures only the primary screen and capturing system audio crashes audio (microphone).
	// TODO: use the system picker on macOS Sonoma and later
	sources.value = window.systemInfo.isWayland || window.systemInfo.isMac ? [...screens, ...windows] : [...screens, entireDesktop, ...windows]

	// Preselect the first media source if any
	if (!selectedSourceId.value) {
		selectedSourceId.value = sources.value?.[0]?.id ?? null
	}
}

/**
 * Handle the suspend event of the video element
 * @param source - The source that was suspended
 */
function handleVideoSuspend(source: ScreensharingSource) {
	sources.value!.splice(sources.value!.indexOf(source), 1)
	if (selectedSourceId.value === source.id) {
		selectedSourceId.value = null
	}
}

/**
 * Handle the submit event of the dialog
 */
function handleSubmit() {
	emit('submit', selectedSourceId.value!)
}

/**
 * Handle the cancel event of the dialog
 */
function handleCancel() {
	emit('cancel')
}
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
