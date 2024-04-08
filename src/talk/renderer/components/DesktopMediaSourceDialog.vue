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
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import MdiCancel from '@mdi/svg/svg/cancel.svg?raw'
import MdiMonitorShare from '@mdi/svg/svg/monitor-share.svg?raw'
import MdiApplicationOutline from 'vue-material-design-icons/ApplicationOutline.vue'
import MdiMonitor from 'vue-material-design-icons/Monitor.vue'
import MdiMonitorSpeaker from 'vue-material-design-icons/MonitorSpeaker.vue'

import NcDialog from '@nextcloud/vue/dist/Components/NcDialog.js'
import NcEmptyContent from '@nextcloud/vue/dist/Components/NcEmptyContent.js'
import NcLoadingIcon from '@nextcloud/vue/dist/Components/NcLoadingIcon.js'

import { translate as t } from '@nextcloud/l10n'

const emit = defineEmits(['submit', 'cancel'])

// On Wayland getting each stream for the live preview requests user to select the source via system dialog again
// Instead - show static images.
// See: https://github.com/electron/electron/issues/27732
const previewType = window.OS.isWayland ? 'thumbnail' : 'live'

const selectedSourceId = ref(null)
const sources = ref(null)
const videoElements = {}

const handleSubmit = () => emit('submit', selectedSourceId.value)
const handleCancel = () => emit('cancel')

const dialogButtons = computed(() => [
	{
		label: t('talk_desktop', 'Cancel'),
		icon: MdiCancel,
		callback: handleCancel,
	},
	{
		label: t('talk_desktop', 'Share screen'),
		type: 'primary',
		icon: MdiMonitorShare,
		disabled: !selectedSourceId.value,
		callback: handleSubmit,
	},
])

const getStreamForMediaSource = (mediaSourceId) => {
	const MAX_PREVIEW_SIZE = 320
	// Special case for sharing all the screens with desktop audio in Electron
	// In this case, it must have exactly these constraints
	// "entire-desktop:0:0" is a custom sourceId for this specific case
	const constraints = mediaSourceId === 'entire-desktop:0:0'
		? {
			audio: {
				mandatory: {
					chromeMediaSource: 'desktop',
				},
			},
			video: {
				mandatory: {
					chromeMediaSource: 'desktop',
					maxWidth: MAX_PREVIEW_SIZE,
					maxHeight: MAX_PREVIEW_SIZE,
				},
			},
		}
		: {
			audio: false,
			video: {
				mandatory: {
					chromeMediaSource: 'desktop',
					chromeMediaSourceId: mediaSourceId,
					maxWidth: MAX_PREVIEW_SIZE,
					maxHeight: MAX_PREVIEW_SIZE,
				},
			},
		}

	return navigator.mediaDevices.getUserMedia(constraints)
}

const requestDesktopCapturerSources = async () => {
	sources.value = await window.TALK_DESKTOP.getDesktopCapturerSources()

	// There is no source. Probably the user hasn't granted the permission.
	if (!sources.value) {
		emit('cancel')
	}

	// On Wayland we don't manually provide the source stream. It is covered by Wayland and custom id is not supported
	if (!window.OS.isWayland) {
		// There is no sourceId for the entire desktop with all the screens and audio in Electron.
		// But it is possible to capture it. "entire-desktop:0:0" is a custom sourceId for this specific case.
		const hasMultipleScreens = sources.value.filter((source) => source.id.startsWith('screen:')).length > 1
		sources.value.unshift({
			id: 'entire-desktop:0:0',
			name: hasMultipleScreens ? t('talk_desktop', 'All screens with audio') : t('talk_desktop', 'Entire screen with audio'),
		})
	}

	// On Wayland there might be no name from the desktopCapturer
	if (window.OS.isWayland) {
		for (const source of sources.value) {
			source.name ||= t('talk_desktop', 'Selected screen or window')
		}
	}

	// Preselect the first media source if any
	selectedSourceId.value = sources.value[0]?.id
}

const setVideoSources = async () => Promise.allSettled(sources.value.map(async (source) => {
	videoElements[source.id].srcObject = await getStreamForMediaSource(source.id)
}))

const releaseVideoSource = (sourceId) => {
	const stream = videoElements[sourceId].srcObject
	for (const track of stream.getTracks()) {
		track.stop()
	}
}

const releaseVideoSources = () => {
	for (const source of sources.value) {
		releaseVideoSource(source.id)
	}
}

const setVideoElement = (element, sourceId) => {
	if (element) {
		videoElements[sourceId] = element
	} else {
		delete videoElements[sourceId]
	}
}

const handleVideoSuspend = (source) => {
	releaseVideoSource(source.id)
	sources.value.splice(sources.value.indexOf(source), 1)
	if (selectedSourceId.value === source.id) {
		selectedSourceId.value = null
	}
}

const showLivePreviews = async () => {
	// Wait for video elements to be mounted
	await nextTick()
	// Set streams for all ids
	await setVideoSources()
}

onMounted(async () => {
	await requestDesktopCapturerSources()

	if (previewType === 'live') {
		await showLivePreviews()
	}
})

onBeforeUnmount(() => {
	// Release all streams, otherwise they are still captured even if no video element is using them
	if (sources.value && previewType === 'live') {
		releaseVideoSources()
	}
})
</script>

<template>
	<NcDialog :name="t('talk_desktop', 'Choose what to share')"
		size="normal"
		:buttons="dialogButtons"
		@update:open="handleCancel">
		<div v-if="sources" class="capture-source-grid">
			<label v-for="source in sources" :key="source.id" class="capture-source">
				<input :id="source.id"
					v-model="selectedSourceId"
					class="capture-source__input"
					type="radio"
					:value="source.id">
				<video v-if="previewType === 'live'"
					:ref="(element) => setVideoElement(element, source.id)"
					class="capture-source__preview"
					muted
					@loadedmetadata="$event.target.play()"
					@suspend="handleVideoSuspend(source)" />
				<img v-else-if="previewType === 'thumbnail' && source.thumbnail"
					alt=""
					:src="source.thumbnail"
					class="capture-source__preview">
				<span v-else class="capture-source__preview" />

				<span class="capture-source__caption">
					<img v-if="source.icon"
						alt=""
						:src="source.icon"
						class="capture-source__caption-icon">
					<MdiMonitorSpeaker v-else-if="source.id.startsWith('entire-desktop:')" :size="16" />
					<MdiMonitor v-else-if="source.id.startsWith('screen:')" :size="16" />
					<MdiApplicationOutline v-else-if="source.id.startsWith('window:')" :size="16" />
					<span class="capture-source__caption-text">{{ source.name }}</span>
				</span>
			</label>
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

.capture-source {
	display: flex;
	flex-direction: column;
	gap: var(--default-grid-baseline);
	overflow: hidden;

	&__input {
		position: absolute;
		z-index: -1;
		opacity: 0 !important;
		width: var(--default-clickable-area);
		height: var(--default-clickable-area);
		margin: 4px 14px;
	}

	&__preview {
		aspect-ratio: 16 / 9;
		object-fit: contain;
		width: calc(100% - 4px - 4px);
		flex: 1 0;
		margin: 4px auto;
		border-radius: var(--border-radius-large);
	}

	&:focus &__preview,
	&:hover &__preview {
		box-shadow: 0 0 0 2px var(--color-primary-element);
		background-color: var(--color-background-hover);
	}

	&:has(&__input:checked) &__preview {
		box-shadow: 0 0 0 4px var(--color-primary-element);
		background-color: var(--color-background-hover);
	}

	&__caption {
		display: flex;
		gap: var(--default-grid-baseline);
		align-items: center;
		padding: var(--default-grid-baseline);
	}

	&__caption-icon {
		height: 16px;
	}

	&__caption-text {
		text-wrap: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
}
</style>
