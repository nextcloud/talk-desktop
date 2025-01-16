<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup>
</script>

<template>
	<nav class="menu">
		<ul class="menu__inner">
			<slot />
		</ul>
	</nav>
</template>

<style scoped>
.menu {
}

.menu__inner {
	display: flex;
	flex-direction: column;
	gap: 2px;
	padding: 4px;
}
</style>
