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
		<slot />
	</div>
</template>

<style scoped>
.settings-subsection__title {
	margin-block: calc(3 * var(--default-grid-baseline));
}
</style>
