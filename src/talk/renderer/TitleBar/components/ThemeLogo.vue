<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import type { CSSProperties } from 'vue'

import { computed } from 'vue'
import { appData } from '../../../../app/AppData.js'

const { size = 20 as number | string } = defineProps<{
	size?: number | string
}>()

const theming = appData.capabilities.theming
const logoUrl = theming.logo
const primaryColor = theming.color

const cssVars = computed<CSSProperties>(() => ({
	'--ThemeLogo-size': typeof size === 'number' ? `${size}px` : size,
	'--ThemeLogo-background-color': primaryColor,
}))
</script>

<template>
	<span class="theme-logo" :style="cssVars">
		<img class="theme-logo__img" :src="logoUrl" alt="">
	</span>
</template>

<style scoped>
.theme-logo {
	display: flex;
	align-items: stretch;
	justify-content: center;
	aspect-ratio: 1 / 1;
	border-radius: var(--border-radius);
	width: var(--ThemeLogo-size);
	height: var(--ThemeLogo-size);
	background-color: var(--ThemeLogo-background-color);
	padding: 10%;
}

.theme-logo__img {
	max-width: 100%;
}
</style>
