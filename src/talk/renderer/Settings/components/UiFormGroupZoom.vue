<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import { t } from '@nextcloud/l10n'
import { computed, nextTick, ref, useTemplateRef } from 'vue'
import NcFormBox from '@nextcloud/vue/components/NcFormBox'
import NcFormGroup from '@nextcloud/vue/components/NcFormGroup'
import NcTextField from '@nextcloud/vue/components/NcTextField'
import IconMinus from 'vue-material-design-icons/Minus.vue'
import IconPencilOutline from 'vue-material-design-icons/PencilOutline.vue'
import IconPlus from 'vue-material-design-icons/Plus.vue'
import UiFormBoxSelectNative from './UiFormBoxSelectNative.vue'
import UiFormBoxSplitButton from './UiFormBoxSplitButton.vue'

/** Zoom factor ~0.5..4 */
const modelValue = defineModel<number>({ required: true })

const ctrl = window.systemInfo.isMac ? 'Ctrl/Cmd' : 'Ctrl'
const zoomHint = t('talk_desktop', 'Zoom can be also changed by {key} or mouse wheel. Reset by {resetKey}', {
	key: `<kbd class="kbd">${ctrl}</kbd><kbd class="kbd">±</kbd>`,
	resetKey: `<kbd class="kbd">${ctrl}</kbd><kbd class=kbd>0</kbd>`,
}, { escape: false })

const MIN_STEP = -6
const MAX_STEP = 17
const STEPS = Array.from(Array(MAX_STEP - MIN_STEP + 1), (_, i) => i + MIN_STEP)
const ZOOM_STEP = 1.2
const STEP_FACTOR = ZOOM_STEP ** 0.5
const stepToFactor = (step: number) => STEP_FACTOR ** step
const factorToStep = (factor: number) => Math.log(factor) / Math.log(STEP_FACTOR)
const roundTo = (value: number, step: number) => Math.round(value / step) * step
const ZOOM_MIN = stepToFactor(MIN_STEP)
const ZOOM_MAX = stepToFactor(MAX_STEP)

const stepOptions = STEPS.filter((step) => step % 2 === 0).map((step) => ({
	label: roundTo(stepToFactor(step) * 100, 5) + '%',
	value: step.toFixed(2),
}))

const stepValue = computed({
	get: () => factorToStep(modelValue.value).toFixed(2),
	set: (value: string) => {
		modelValue.value = stepToFactor(parseFloat(value))
	},
})

const percentValue = computed({
	get: () => Math.round(modelValue.value * 100),
	set: (value: number) => {
		modelValue.value = isFinite(value) ? Math.min(Math.max(value / 100, ZOOM_MIN), ZOOM_MAX) : 1
	},
})

const editButtonInstance = useTemplateRef('editButton')
const showInput = ref(false)
const inputInstance = useTemplateRef('input')

/**
 * Switch to input
 */
async function onShowInput() {
	showInput.value = true
	await nextTick()
	inputInstance.value!.focus()
}

/**
 * Switch back to the edit button
 */
async function focusEditButton() {
	editButtonInstance.value!.$el.querySelector('button').focus()
}
</script>

<template>
	<NcFormGroup :label="t('talk_desktop', 'Zoom')" class="zoom-box">
		<template #description>
			<!-- eslint-disable-next-line vue/no-v-html -->
			<span v-html="zoomHint" />
		</template>

		<NcFormBox class="zoom-box__row" row>
			<UiFormBoxSplitButton
				:label="t('talk_desktop', 'Zoom out')"
				hide-label
				:disabled="modelValue / STEP_FACTOR < ZOOM_MIN"
				@click="modelValue /= STEP_FACTOR">
				<template #icon>
					<IconMinus :size="20" />
				</template>
			</UiFormBoxSplitButton>

			<UiFormBoxSplitButton
				:label="t('talk_desktop', 'Zoom in')"
				hide-label
				:disabled="modelValue * STEP_FACTOR > ZOOM_MAX"
				@click="modelValue *= STEP_FACTOR">
				<template #icon>
					<IconPlus :size="20" />
				</template>
			</UiFormBoxSplitButton>

			<UiFormBoxSelectNative
				v-if="!showInput"
				v-model="stepValue"
				:label="t('talk_desktop', 'Zoom')"
				:options="stepOptions"
				:unselected="Math.round(modelValue * 100) + '%'" />
			<NcTextField
				v-else
				ref="input"
				class="zoom-box__edit"
				input-class="zoom-box__edit-input"
				:aria-label="t('talk_desktop', 'Zoom')"
				inputmode="number"
				:model-value="percentValue"
				@change="percentValue = $event.target.value /* TODO: add lazy modifier support */"
				@blur="showInput = false"
				@keydown.enter.prevent="focusEditButton" />

			<UiFormBoxSplitButton
				ref="editButton"
				:aria-description="t('talk_desktop', 'Edit zoom')"
				:class="{ 'zoom-box__edit-button--hidden': showInput }"
				hide-label
				@click="onShowInput">
				<template #icon>
					<IconPencilOutline :size="20" />
				</template>
			</UiFormBoxSplitButton>

			<UiFormBoxSplitButton :label="t('talk_desktop', 'Reset')" @click="modelValue = 1" />
		</NcFormBox>
	</NcFormGroup>
</template>

<style scoped>
.zoom-box__edit {
	/* TODO: respect parent height in upstream? */
	--font-box-item-height-2-lines: calc(2rlh + 2 * 2 * var(--default-grid-baseline) + 3px);
	height: var(--font-box-item-height-2-lines);
	:deep(.zoom-box__edit-input) {
		height: var(--font-box-item-height-2-lines) !important;
	}
}

.zoom-box__edit-button--hidden {
	position: absolute;
	opacity: 0;
	z-index: -1;
}
</style>
