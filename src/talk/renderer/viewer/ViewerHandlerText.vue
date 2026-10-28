<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import type { ViewerEmits, ViewerProps } from '@nextcloud/viewer'

import { t } from '@nextcloud/l10n'
import { useHotKey } from '@nextcloud/vue/composables/useHotKey'
import { computed, onBeforeMount, ref, useTemplateRef } from 'vue'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcEmptyContent from '@nextcloud/vue/components/NcEmptyContent'
import NcRichText from '@nextcloud/vue/components/NcRichText'
import IconArrowLeftRight from 'vue-material-design-icons/ArrowLeftRight.vue'
import IconFileOutline from 'vue-material-design-icons/FileOutline.vue'
import IconWrap from 'vue-material-design-icons/Wrap.vue'
import ButtonCopy from '../../../shared/components/ButtonCopy.vue'
import { browserStorage } from '../../../shared/browserStorage.service.ts'
import { useBrowserStorage } from '../../../shared/useBrowserStorage.ts'
import { getFileContent } from './files.service.ts'

const props = defineProps<ViewerProps>()
const emit = defineEmits<ViewerEmits>()

const MAX_HIGHLIGHTED_CODE_LENGTH = 1 * 1024 * 1024 // 1 MB (for 8-bit characters)
const MD_CODE_BLOCK_BOUNDARY = '`````'

const maxWidthPx = computed(() => props.maxWidth + 'px')
const maxHeightPx = computed(() => props.maxHeight + 'px')

const content = ref<string | null>(null)

onBeforeMount(async () => {
	try {
		content.value = await getFileContent(props.file, 'text')
		emit('loaded')
	} catch (error) {
		emit('errored', error as Error)
	}
})

const isRichText = computed(() => props.file.mime === 'text/markdown')
const isCode = computed(() => props.file.mime !== 'text/markdown' && props.file.mime !== 'text/plain')

const wrap = useBrowserStorage<boolean>(browserStorage, 'viewer:wrap', true)
const wide = useBrowserStorage<boolean>(browserStorage, 'viewer:wide', false)

const contentCodeBlock = computed(() => {
	const lang = props.file.extension?.slice(1).toLowerCase()

	if (
		!content.value
		|| !isCode.value
		|| !lang
		// Do not highlight too large files to avoid performance issues
		|| content.value.length > MAX_HIGHLIGHTED_CODE_LENGTH
		// Having the same number of backticks breaks MD code block
		// Cheaper to ignore long backticks than search for the longest and wrap into even longer for such rare cases
		|| content.value.includes(MD_CODE_BLOCK_BOUNDARY)
	) {
		return null
	}

	return MD_CODE_BLOCK_BOUNDARY + lang + '\n' + content.value + '\n' + MD_CODE_BLOCK_BOUNDARY
})

const contentRef = useTemplateRef('contentRef')
useHotKey('a', () => {
	if (contentRef.value) {
		window.getSelection()?.selectAllChildren(contentRef.value)
	}
}, { ctrl: true, prevent: true, allowInModal: true })
</script>

<template>
	<div class="viewer-text">
		<template v-if="content">
			<div role="group" :aria-label="t('talk_desktop', 'Controls')" class="viewer-text__controls">
				<NcButton
					v-model:pressed="wide"
					:aria-label="t('talk_desktop', 'Full width')"
					:title="t('talk_desktop', 'Full width')"
					variant="tertiary">
					<template #icon>
						<IconArrowLeftRight :size="20" />
					</template>
				</NcButton>
				<NcButton
					v-if="!isRichText"
					v-model:pressed="wrap"
					:aria-label="t('talk_desktop', 'Wrap content')"
					:title="t('talk_desktop', 'Wrap content')"
					variant="tertiary">
					<template #icon>
						<IconWrap :size="20" />
					</template>
				</NcButton>
				<ButtonCopy :content variant="tertiary" labelHidden />
			</div>

			<div class="viewer-text__content-scroller">
				<div
					ref="contentRef"
					role="document"
					:aria-label="file.displayname"
					class="viewer-text__content"
					:class="{
						'viewer-text__content--wide': wide,
						'viewer-text__content--wrap': wrap,
					}">
					<NcRichText
						v-if="contentCodeBlock"
						class="viewer-text__code"
						:text="contentCodeBlock"
						useExtendedMarkdown />
					<NcRichText v-else-if="isRichText" :text="content" useExtendedMarkdown />
					<div v-else class="viewer-text__txt" v-text="content" />
				</div>
			</div>
		</template>

		<div v-else class="viewer-text__empty">
			<NcEmptyContent :name="t('talk_desktop', 'The file is empty')">
				<template #icon>
					<IconFileOutline />
				</template>
			</NcEmptyContent>
		</div>
	</div>
</template>

<style scoped>
/* TODO: add stretch mode to @nextcloud/viewer to avoid size set via JS */
.viewer-text {
	background-color: var(--color-main-background);
	display: flex;
	flex-direction: column;
	align-items: stretch;
	width: v-bind(maxWidthPx);
	height: v-bind(maxHeightPx);
	overflow: hidden;
}

.viewer-text__controls {
	background-color: var(--color-main-background);
	border-bottom: 1px solid var(--color-border);
	width: 100%;
	display: flex;
	gap: calc(var(--default-grid-baseline) * 2);
	justify-content: flex-end;
	padding: calc(var(--default-grid-baseline) * 2);
}

.viewer-text__content-scroller {
	flex: 1;
	overflow-x: auto;
	padding: calc(var(--default-grid-baseline) * 4);
}

.viewer-text__content {
	/* Align with Text --text-editor-max-width */
	max-width: min(80ch, (100% - 2 * 40px));
	margin-inline: auto;
}

.viewer-text__content--wide {
	max-width: 100%;
}

/* Align with Text */
/* TODO: adjust default NcRichText styles? */
:deep(.rich-text__code-block) {
	border-radius: var(--border-radius);
	pre {
		padding: 1em;
	}
}

.viewer-text__txt {
	/* Align with Text */
	background-color: var(--color-background-dark);
	border-radius: var(--border-radius);
	padding: 1em;
	overflow-x: auto;
	white-space: pre;
}

.viewer-text__content--wrap {
	.viewer-text__txt,
	.viewer-text__code :deep(.rich-text__code-block pre) {
		text-wrap: wrap;
		overflow-wrap: break-word;
	}
}

.viewer-text__empty {
	height: 100%;
	display: flex;
	flex-direction: column;
}
</style>
