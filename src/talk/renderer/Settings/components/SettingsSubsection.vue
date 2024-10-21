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
		<h4 v-if="name" class="settings-subsection__title">
			{{ name }}
		</h4>
		<div class="setting-subsection__content">
			<slot />
		</div>
	</div>
</template>

<style scoped>
.setting-subsection__content {
	display: flex;
	flex-direction: column;
	gap: var(--default-grid-baseline);
	align-items: stretch;
}
</style>
