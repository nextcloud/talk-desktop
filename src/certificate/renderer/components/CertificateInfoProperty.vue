<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
defineProps<{
	term?: string
	value?: string
}>()
</script>

<template>
	<dt class="certificate-info-property__dt">
		<slot name="term">
			{{ term }}
		</slot>
	</dt>
	<dd class="certificate-info-property__dd">
		<slot>
			{{ value }}
		</slot>
	</dd>
</template>

<style scoped>
.certificate-info-property__dt {
	/* Override default server styles */
	width: auto;
	white-space: normal;
	text-align: start;
	text-transform: capitalize;
	padding: 0;
}

.certificate-info-property__dd {
	color: var(--color-text-maxcontrast);
	padding: 0;
}
</style>
