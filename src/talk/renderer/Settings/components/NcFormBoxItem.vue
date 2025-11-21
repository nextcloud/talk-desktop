<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
/**
 * A copy of nextcloud-libraries/nextcloud-vue/src/components/NcFormBoxItem
 * Changes:
 * - No legacy mode support (not needed)
 * - No useNcFormBox - replaced with inject in place for simplicity
 * - No createElementId - replaced with useId for simplicity
 * - VueClassType defined in place
 */

import type { Slot } from 'vue'

import { inject, useId } from 'vue'

type ClassType = string | Record<string, boolean | undefined>
type VueClassType = ClassType | ClassType[] | VueClassType[]

defineOptions({ inheritAttrs: false })

const {
	tag,
	label = undefined,
	description = undefined,
	invertedAccent = false,
	class: rootClasses = undefined,
	itemClasses = undefined,
} = defineProps<{
	/** Interactive item element's tag */
	tag: string
	/** Main Label */
	label?: string
	/** Optional description below the label, also used for the aria-describedby */
	description?: string
	/** Accent on the description instead of the label */
	invertedAccent?: boolean
	/** Root element classes */
	class?: VueClassType
	/** Interactive item classes */
	itemClasses?: VueClassType
}>()

defineEmits<{
	/** Click on the item */
	click: [event: MouseEvent]
}>()

const slots = defineSlots<{
	/** Item's label custom content */
	default?: Slot<{
		/** IDRef of the description element if present */
		descriptionId?: string
	}>
	/** Custom description content */
	description?: Slot<{
		/** IDRef of the description element if present */
		descriptionId?: string
	}>
	/** Icon content */
	icon?: Slot
}>()

const { formBoxItemClass } = inject(Symbol.for('NcFormBox:context'), { formBoxItemClass: undefined }) as { formBoxItemClass: string | undefined }

const descriptionId = useId()
const hasDescription = () => !!description || !!slots.description
</script>

<template>
	<div
		:class="[
			rootClasses,
			$style.formBoxItem,
			formBoxItemClass,
			{
				[$style.formBoxItem_inverted]: invertedAccent && hasDescription(),
			},
		]">
		<span :class="$style.formBoxItem__content">
			<component
				:is="tag"
				:class="[$style.formBoxItem__element, itemClasses]"
				v-bind="$attrs"
				@click="$emit('click', $event)">
				<slot :description-id>
					{{ label || '⚠️ Label is missing' }}
				</slot>
			</component>
			<span v-if="hasDescription()" :id="descriptionId" :class="$style.formBoxItem__description">
				<slot name="description">
					{{ description }}
				</slot>
			</span>
		</span>
		<span :class="$style.formBoxItem__icon">
			<slot name="icon" :description-id>
				⚠️ Icon is missing
			</slot>
		</span>
	</div>
</template>

<style lang="scss" module>
.formBoxItem {
	--nc-form-box-item-border-width: 1px;
	--nc-form-box-item-min-height: 40px; // Special size defined by the design
	--form-element-label-offset: calc(var(--border-radius-element) + var(--default-grid-baseline));
	--form-element-label-padding: calc(var(--form-element-label-offset) - var(--nc-form-box-item-border-width));
	// New colors we don't yet have in theming
	// TODO: add new colors to the theming
	--color-primary-element-extra-light: hsl(from var(--color-primary-element-light) h s calc(l * 1.045));
	--color-primary-element-extra-light-hover: hsl(from var(--color-primary-element-light-hover) h s calc(l * 1.045));
	position: relative;
	display: flex;
	align-items: center;
	gap: calc(2 * var(--default-grid-baseline));
	min-height: var(--nc-form-box-item-min-height);
	padding-inline: var(--form-element-label-padding);
	border: 1px solid var(--color-primary-element-extra-light-hover);
	border-block-end-width: 2px;
	border-radius: var(--border-radius-element);
	background-color: var(--color-primary-element-extra-light);
	color: var(--color-main-text);
	transition-property: color, border-color, background-color;
	transition-duration: var(--animation-quick);
	transition-timing-function: linear;
	-webkit-user-select: none;
	user-select: none;
	cursor: pointer;

	* {
		cursor: inherit;
	}

	&:has(:disabled) {
		cursor: default;
		opacity: 0.5;
	}

	&:hover:not(:has(:disabled)) {
		color: var(--color-primary-element-light-text);
		background-color: var(--color-primary-element-extra-light-hover);
	}

	&:has(:focus-visible) {
		outline: 2px solid var(--color-main-text);
		box-shadow: 0 0 0 4px var(--color-main-background);
	}

	&.formBoxItem_legacy {
		--nc-form-box-item-border-width: 0px;
		border: none;
	}

	&.formBoxItem_inverted {
		.formBoxItem__element {
			color: var(--color-text-maxcontrast);
		}

		.formBoxItem__description {
			color: inherit;
		}
	}
}

.formBoxItem__content {
	flex: 1;
	display: flex;
	flex-direction: column;
	padding-block: calc(2 * var(--default-grid-baseline));
	overflow-wrap: anywhere;
}

// A trick for accessibility:
// make entire component clickable while internally splitting the interactive item and the description
.formBoxItem__element::after {
	content: '';
	position: absolute;
	inset: 0;
}

.formBoxItem__description {
	color: var(--color-text-maxcontrast);
}

.formBoxItem__icon {
	display: flex;
	align-items: center;
	justify-content: flex-end;
}
</style>
