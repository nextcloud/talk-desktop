<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
const {
	enabled = false,
	size = '6px',
	insetBlockStart = '20%',
	insetInlineEnd = '20%',
	noOutline = false,
} = defineProps<{
	/**
	 * Whether to show the dot
	 */
	enabled?: boolean
	/**
	 * CSS size of the dot, e.g. '6px'. With the gap around it will be twice bigger.
	 */
	size?: string
	/**
	 * Position of the dot's center from the block start.
	 * Default is 20%, but due to different icon's shape the perfect position might vary.
	 */
	insetBlockStart?: string
	/**
	 * Position of the dot's center from the inline end.
	 * Default is 20%, but due to different icon's shape the perfect position might vary.
	 */
	insetInlineEnd?: string
	/**
	 * Whether to remove the transparent outline around the dot icon.
	 * The outline helps to separate the dot from the icon, but may look bad when the dote does not overlap with the icon at all.
	 */
	noOutline?: boolean
}>()
</script>

<template>
	<span :class="$style.dotBadge">
		<span :class="{ [$style.dotBadge__iconWithDotHole]: enabled && !noOutline }">
			<slot />
		</span>
		<sup v-if="enabled" :class="[$style.dotBadge__dot]" />
	</span>
</template>

<style module>
.dotBadge {
	position: relative;
}

/* Adding a mask to create a gap between the the dot and the icon (like a hole), so they do not touch */
.dotBadge__iconWithDotHole {
	/* radial-gradient circle is defined by radius, not diameter size. */
	/* Using diameter size as the radius here is intentional to make the hole twice bigger than the dot. */
	mask: radial-gradient(circle v-bind(size) at top v-bind(insetBlockStart) right v-bind(insetInlineEnd), transparent 100%, white 100%);

	/* radial-gradient does not support logical properties */
	&:dir(rtl) {
		mask: radial-gradient(circle v-bind(size) at top v-bind(insetBlockStart) left v-bind(insetInlineEnd), transparent 100%, white 100%);
	}
}

.dotBadge__dot {
	display: inline-block;
	border-radius: 50%;
	width: v-bind(size);
	height: v-bind(size);
	background-color: var(--color-text-error);
	position: absolute;
	inset-block-start: calc(v-bind(insetBlockStart) - v-bind(size) / 2);
	inset-inline-end: calc(v-bind(insetInlineEnd) - v-bind(size) / 2);
}
</style>
