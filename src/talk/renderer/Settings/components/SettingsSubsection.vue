<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
defineProps<{
	name?: string
}>()
</script>

<template>
	<div class="settings-subsection">
		<h3 v-if="name" class="settings-subsection__title">
			{{ name }}
		</h3>
		<div class="setting-subsection__content">
			<slot />
		</div>
	</div>
</template>

<style scoped>
.settings-subsection__title {
	/* Override the default margin */
	margin-block-start: 0 !important;
}

.setting-subsection__content {
	display: flex;
	flex-direction: column;
	gap: var(--default-grid-baseline);
	align-items: stretch;
}
</style>
