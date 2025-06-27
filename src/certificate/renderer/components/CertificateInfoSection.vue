<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
defineProps<{
	title?: string
}>()
</script>

<template>
	<dt class="certificate-info__section-dt">
		<slot name="title">
			{{ title }}
		</slot>
	</dt>
	<dd class="certificate-info__section-dd">
		<dl class="certificate-info-properties" :title="title">
			<slot />
		</dl>
	</dd>
</template>

<style scoped>
.certificate-info__section-dt {
	width: auto;
	display: flex;
	gap: calc(3 * var(--default-grid-baseline));
	padding: 0;
	text-transform: capitalize;
	font-weight: bold;

	&::after {
		content: '';
		border-bottom: 2px solid var(--color-border);
		flex: 1 1 auto;
		height: 0.5lh;
	}
}

.certificate-info__section-dd {
	margin-inline-start: calc(4 * var(--default-grid-baseline));
	padding: 0;
}

.certificate-info-properties {
	display: grid;
	/* 210 is about the minimal value for the longest word in German/French */
	/* There might be a language with longer value, but it supports text wrap */
	grid-template-columns: min(210px, 50%) auto;
	gap: var(--default-grid-baseline);
	padding: 0;
}
</style>
