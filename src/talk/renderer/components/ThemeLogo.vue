<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup>
import { computed } from 'vue'
import { appData } from '../../../app/AppData.js'

const props = defineProps({
	size: {
		type: [Number, String],
		default: 20,
	},
})

const theming = appData.capabilities.theming
const logoUrl = theming.logo
const primaryColor = theming.color

const cssVars = computed(() => ({
	'--ThemeLogo-size': typeof props.size === 'number' ? `${props.size}px` : props.size,
	'--ThemeLogo-background-color': primaryColor,
}))
</script>

<template>
	<span class="theme-logo" :style="cssVars">
		<img class="theme-logo__img" :src="logoUrl" alt="">
	</span>
</template>

<style scoped lang="scss">
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
