<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { ScreensharingSource, ScreensharingSourceId } from './screensharing.types.ts'

import IconCancel from '@mdi/svg/svg/cancel.svg?raw'
import IconMonitorShare from '@mdi/svg/svg/monitor-share.svg?raw'
import { t } from '@nextcloud/l10n'
import { useWindowFocus } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import NcCheckboxRadioSwitch from '@nextcloud/vue/components/NcCheckboxRadioSwitch'
import NcDialog from '@nextcloud/vue/components/NcDialog'
import NcDialogButton from '@nextcloud/vue/components/NcDialogButton'
import NcEmptyContent from '@nextcloud/vue/components/NcEmptyContent'
import NcLoadingIcon from '@nextcloud/vue/components/NcLoadingIcon'
import DesktopMediaSourcePreview from './DesktopMediaSourcePreview.vue'

const emit = defineEmits<{
	submit: [ScreensharingSourceId]
	cancel: []
}>()

const livePreview = ref(false)
const selectedSourceId = ref<ScreensharingSourceId | null>(null)
const sources = ref<ScreensharingSource[] | null>(null)

const screenSources = computed(() => sources.value?.filter((source) => source.id.startsWith('screen:') || source.id.startsWith('entire-desktop:')))
const windowSources = computed(() => sources.value?.filter((source) => source.id.startsWith('window:')))

const singleSource = computed(() => sources.value && sources.value.length === 1)

// On Wayland instead of the list of all available sources,
// the system picker is used to have a list of a single selected source.
// Getting the stream for the selected source triggers the system picker again.
// As a result:
// - Live preview is not possible
// - Sources list update is not possible
// - There is no the entire-desktop option
// See also: https://github.com/electron/electron/issues/27732
const livePreviewAvailable = !window.systemInfo.isWayland
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
 *
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
	<NcDialog
		:name="t('talk_desktop', 'Choose what to share')"
		size="large"
		@update:open="handleCancel">
		<div v-if="sources" class="capture-source-grid">
			<h3 v-if="screenSources?.length && !singleSource" class="capture-source-section-heading">
				{{ t('talk_desktop', 'Entire screens') }}
			</h3>
			<DesktopMediaSourcePreview
				v-for="source in screenSources"
				:key="source.id"
				:source="source"
				:live="livePreview"
				:selected="selectedSourceId === source.id"
				@select="selectedSourceId = source.id"
				@suspend="handleVideoSuspend(source)" />

			<h3 v-if="!singleSource && windowSources?.length" class="capture-source-section-heading">
				{{ t('talk_desktop', 'Application windows') }}
			</h3>
			<DesktopMediaSourcePreview
				v-for="source in windowSources"
				:key="source.id"
				:source="source"
				:live="livePreview"
				:selected="selectedSourceId === source.id"
				@select="selectedSourceId = source.id"
				@suspend="handleVideoSuspend(source)" />
		</div>

		<NcEmptyContent v-else :name="t('talk_desktop', 'Loading …')">
			<template #icon>
				<NcLoadingIcon />
			</template>
		</NcEmptyContent>

		<template #actions>
			<NcCheckboxRadioSwitch
				v-if="sources && livePreviewAvailable"
				v-model="livePreview"
				type="switch"
				class="capture-mode-switch">
				{{ t('talk_desktop', 'Live preview') }}
			</NcCheckboxRadioSwitch>
			<NcDialogButton :icon="IconCancel" :label="t('talk_desktop', 'Cancel')" @click="handleCancel" />
			<NcDialogButton
				:icon="IconMonitorShare"
				:label="t('talk_desktop', 'Share screen')"
				variant="primary"
				:disabled="!selectedSourceId"
				@click="handleSubmit" />
		</template>
	</NcDialog>
</template>

<style scoped lang="scss">
.capture-source-grid {
	display: grid;
	/* 280 is approximately 1/3 of the default large dialog size */
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	grid-gap: calc(var(--default-grid-baseline) * 2);
	width: 100%;
	padding: calc(2 * var(--default-grid-baseline));
}

.capture-source-section-heading {
	grid-column: 1 / -1;
	font-size: 18px;
	text-align: center;
	margin-block: calc(2 * var(--default-grid-baseline)) 0;
}

.capture-mode-switch {
	margin-inline-end: auto;
}
</style>
