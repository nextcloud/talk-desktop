<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import { t } from '@nextcloud/l10n'
import { computed, nextTick, ref, useId, useTemplateRef, watch } from 'vue'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcFormBox from '@nextcloud/vue/components/NcFormBox'
import NcFormGroup from '@nextcloud/vue/components/NcFormGroup'
import NcTextField from '@nextcloud/vue/components/NcTextField'
import IconMinus from 'vue-material-design-icons/Minus.vue'
import IconPlus from 'vue-material-design-icons/Plus.vue'

/** Zoom factor ~0.5..4 */
const modelValue = defineModel<number>({ required: true })

const stepsDatalistId = useId()

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
const ZOOM_MIN = stepToFactor(MIN_STEP)
const ZOOM_MAX = stepToFactor(MAX_STEP)

/** Zoom factor ~0.5..4 on the range, separate from modelValue to not change the zoom during mouse moving */
const rangeValue = ref(0)
watch(modelValue, () => {
	rangeValue.value = factorToStep(modelValue.value)
}, { immediate: true })

// Do not sync value while cursor is moving to prevent UI shift during the interaction
const isRangeMouseSliding = ref(false)

/**
 * Handle range value change
 *
 * @param newValue - New value from range input
 */
function onRangeChange(newValue: number) {
	if (!isRangeMouseSliding.value) {
		modelValue.value = stepToFactor(newValue)
	}
}

const showInput = ref(false)
const inputInstance = useTemplateRef('input')
/** Zoom factor in % and limits */
const inputValue = computed({
	get: () => {
		console.log(isRangeMouseSliding.value, modelValue.value, rangeValue.value, Math.round(stepToFactor(rangeValue.value) * 100))
		return !isRangeMouseSliding.value ? Math.round(modelValue.value * 100) : Math.round(stepToFactor(rangeValue.value) * 100)
	},
	set: (value: number) => {
		modelValue.value = isFinite(value) ? Math.min(Math.max(value / 100, ZOOM_MIN), ZOOM_MAX) : 1
	},
})

/**
 * Switch to input
 */
async function onShowInput() {
	showInput.value = true
	await nextTick()
	inputInstance.value!.focus()
}
</script>

<template>
	<NcFormGroup :label="t('talk_desktop', 'Zoom')" class="zoom-box">
		<template #description>
			<!-- eslint-disable-next-line vue/no-v-html -->
			<span v-html="zoomHint" />
		</template>

		<NcFormBox v-slot="{ itemClass }" class="zoom-box__row" row>
			<NcButton
				:class="itemClass"
				variant="tertiary"
				wide
				@click="modelValue = 1">
				{{ t('talk_desktop', 'Reset') }}
			</NcButton>

			<NcButton
				:aria-label="t('talk_desktop', 'Zoom out')"
				:class="itemClass"
				@click="modelValue /= STEP_FACTOR">
				<template #icon>
					<IconMinus :size="20" />
				</template>
			</NcButton>

			<input
				v-model="rangeValue"
				:aria-label="t('talk_desktop', 'Zoom')"
				class="zoom-box__range"
				type="range"
				:min="MIN_STEP"
				:max="MAX_STEP"
				step="1"
				:list="stepsDatalistId"
				@change="onRangeChange(($event.target as HTMLInputElement).valueAsNumber)"
				@mousedown="isRangeMouseSliding = true"
				@mouseup="isRangeMouseSliding = false">
			<datalist :id="stepsDatalistId">
				<option v-for="step in STEPS" :key="step" :value="step" />
			</datalist>

			<NcButton
				:aria-label="t('talk_desktop', 'Zoom in')"
				:class="itemClass"
				@click="modelValue *= STEP_FACTOR">
				<template #icon>
					<IconPlus :size="20" />
				</template>
			</NcButton>

			<NcButton
				v-if="!showInput"
				class="zoom-box__edit-button"
				:aria-description="t('talk_desktop', 'Edit zoom')"
				variant="tertiary"
				@click="onShowInput">
				{{ inputValue }}%
			</NcButton>
			<NcTextField
				v-else
				ref="input"
				:aria-label="t('talk_desktop', 'Zoom')"
				inputmode="number"
				class="zoom-box__edit"
				:model-value="inputValue"
				@change="inputValue = $event.target.value /* TODO: add lazy modifier support */"
				@blur="showInput = false" />
		</NcFormBox>
	</NcFormGroup>
</template>

<style scoped>
.zoom-box {
	/* Same as <NcKbd> */
	:deep(.kbd) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: var(--default-clickable-area);
		height: var(--default-clickable-area);
		padding-inline: calc(2 * var(--default-grid-baseline)) calc(2 * var(--default-grid-baseline));
		border: 2px solid var(--color-primary-element-light);
		border-block-end-width: 4px;
		border-radius: var(--border-radius-element);
		box-shadow: none; /* Override server <kbd> styles */
		font-family: var(--font-family); /* Design decision: looks better with the default font instead of mono */
		line-height: 1;
		white-space: nowrap;

		& + :deep(.kbd) {
			margin-inline-start: calc(1 * var(--default-grid-baseline));
		}
	}
}

.zoom-box__row > * {
	flex: 0 0 fit-content;
}

.zoom-box__range {
	flex: 1 0;
	margin: 0;
	height: var(--default-clickable-area);
	accent-color: var(--color-primary-element);
}

.zoom-box__edit,
.zoom-box__edit-button {
	flex-basis: 75px;
}
</style>
