<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup>
import { t } from '@nextcloud/l10n'
import { computed, ref, toRef } from 'vue'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcCheckboxRadioSwitch from '@nextcloud/vue/components/NcCheckboxRadioSwitch'
import NcEmptyContent from '@nextcloud/vue/components/NcEmptyContent'
import NcRichText from '@nextcloud/vue/components/NcRichText'
import IconCheck from 'vue-material-design-icons/Check.vue'
import IconContentCopy from 'vue-material-design-icons/ContentCopy.vue'
import IconFileChartOutline from 'vue-material-design-icons/FileChartOutline.vue'
import IconFileDocumentOutline from 'vue-material-design-icons/FileDocumentOutline.vue'
import IconFileOutline from 'vue-material-design-icons/FileOutline.vue'
import IconWrap from 'vue-material-design-icons/Wrap.vue'
import ViewerHandlerBase from './ViewerHandlerBase.vue'
import { useFileContent } from './viewer.composables.ts'

const props = defineProps({
	file: {
		type: Object,
		required: true,
	},
})

const format = computed(() => {
	const mimeToFormat = {
		'text/markdown': 'md',
		'text/plain': 'txt',
	}
	return mimeToFormat[props.file.mime] ?? 'code'
})

const layout = ref('compact')

const wrap = ref(true)
const wrapLabel = computed(() => format.value === 'md' ? t('talk_desktop', 'Wrap content in code blocks') : t('talk_desktop', 'Wrap content'))

const justCopied = ref(false)

const { content, loading, error } = useFileContent(toRef(() => props.file.filename), 'text')

/**
 * Copy the content of the file to the clipboard
 */
function copy() {
	navigator.clipboard.writeText(content.value)
	justCopied.value = true
	setTimeout(() => {
		justCopied.value = false
	}, 2000)
}
</script>

<template>
	<ViewerHandlerBase :loading="loading" :error="error" :error-description="error">
		<template #default>
			<div class="viewer-text">
				<template v-if="content">
					<fieldset :aria-label="t('talk_desktop', 'Controls')" class="viewer-text__controls">
						<fieldset class="viewer-text__layout-switch" :aria-label="t('talk_desktop', 'Layout')">
							<NcCheckboxRadioSwitch
								v-model="layout"
								:aria-label="t('talk_desktop', 'Compact')"
								value="compact"
								type="radio"
								name="layout"
								button-variant
								button-variant-grouped="horizontal">
								<template #icon>
									<IconFileDocumentOutline :size="20" />
								</template>
							</NcCheckboxRadioSwitch>
							<NcCheckboxRadioSwitch
								v-model="layout"
								:aria-label="t('talk_desktop', 'Wide')"
								value="wide"
								type="radio"
								name="layout"
								button-variant
								button-variant-grouped="horizontal">
								<template #icon>
									<IconFileChartOutline :size="20" style="transform: rotate(90deg) scaleX(-1)" />
								</template>
							</NcCheckboxRadioSwitch>
						</fieldset>
						<NcButton
							v-model:pressed="wrap"
							:aria-label="wrapLabel"
							:title="wrapLabel"
							variant="tertiary">
							<template #icon>
								<IconWrap :size="20" />
							</template>
						</NcButton>
						<NcButton
							:aria-label="t('talk_desktop', 'Copy content')"
							:title="t('talk_desktop', 'Copy content')"
							variant="tertiary"
							@click="copy">
							<template #icon>
								<IconCheck v-if="justCopied" :size="20" />
								<IconContentCopy v-else :size="20" />
							</template>
						</NcButton>
					</fieldset>

					<div
						:aria-label="t('talk_desktop', 'Read-only text file content')"
						class="viewer-text__content"
						:class="[
							`viewer-text__content--${format}`,
							{
								'viewer-text__content--compact': layout === 'compact',
								'viewer-text__content--wrap': wrap,
							},
						]"
						contenteditable
						spellcheck="false"
						@beforeinput.prevent>
						<code v-if="format === 'code'">{{ content }}</code>
						<NcRichText v-else :text="content" :use-extended-markdown="format === 'md'" />
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
	</ViewerHandlerBase>
</template>

<style scoped>
.viewer-text {
	background-color: var(--color-main-background);
	position: relative;
	overflow: auto;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 0 calc(var(--default-grid-baseline) * 2);
}

.viewer-text__controls {
	background-color: inherit;
	width: 100%;
	display: flex;
	gap: var(--default-grid-baseline);
	justify-content: flex-end;
	padding: calc(var(--default-grid-baseline) * 2) 0;
	position: sticky;
	inset-block-start: 0;
}

.viewer-text__layout-switch {
	display: flex;
}

.viewer-text__content {
	flex: 1 0 auto;
	width: 100%;
	overflow-x: auto;
	/* Reset global rich contenteditable styles */
	background-color: unset;
	border: none;
	border-radius: 0;
	padding: 0;
	margin: 0;

	&:focus-visible,
	&:hover,
	&:focus,
	&:active {
		box-shadow: none !important;
		border: none !important;
	}
}

.viewer-text__content--compact {
	max-width: 900px;
}

.viewer-text__content--md :deep(pre) {
	background: var(--color-background-dark);
	padding: 1em;
	overflow: auto;
	white-space: pre;
}

.viewer-text__content--md :deep(ul) {
	/* The default value is too small and doesnt fit the marker */
	/* TODO: fix in upstream */
	padding-inline-start: 1.2em !important;
}

.viewer-text__content--md.viewer-text__content--wrap :deep(pre) {
	white-space: pre-wrap;
}

.viewer-text__content--txt,
.viewer-text__content--code {
	white-space: pre;

	&.viewer-text__content--wrap {
		white-space: pre-wrap;
	}
}

.viewer-text__content--code code {
	display: block;
}

.viewer-text__empty {
	height: 100%;
	display: flex;
	flex-direction: column;
}
</style>
