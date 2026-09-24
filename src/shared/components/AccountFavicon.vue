<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { appData } from '../../app/AppData.js'

const {
	serverUrl = appData.serverUrl,
	themingCapabilities = appData.capabilities?.theming,
	size = 20 as number | string,
} = defineProps<{
	/**
	 * Nextcloud server URL to get the favicon from.
	 * If not defined, fallback to the latest server favicon.
	 */
	serverUrl?: string
	/**
	 * Theming capabilities. Used for:
	 * - Determining whether the theming app is enabled
	 * - Getting the cache buster
	 *
	 * Note that capabilities also have "favicon" property.
	 * However, since the beginning it has never had the actual favicon URL.
	 * Same as the "logoheader" property, it has the same value as the "logo" property.
	 */
	themingCapabilities?: {
		cacheBuster?: string
	}
	/**
	 * Favicon size
	 */
	size?: number | string
}>()

const defaultBuiltInFavicon = new URL('@global-styles/core/img/favicon.ico', import.meta.url).href

const failedLoading = ref(false)
watch(() => serverUrl, () => failedLoading.value = false)

const faviconUrl = computed(() => {
	if (!serverUrl || failedLoading.value) {
		return defaultBuiltInFavicon
	}

	return themingCapabilities
		// Custom theming favicon
		? `${serverUrl}/index.php/apps/theming/favicon?v=${themingCapabilities.cacheBuster || Date.now()}`
		// Default server favicon in case theming is disabled
		: `${serverUrl}/core/img/favicon.ico`
})

const cssSize = computed(() => typeof size === 'number' ? `${size}px` : size)
</script>

<template>
	<img
		class="theme-logo"
		:src="faviconUrl"
		alt=""
		@error="failedLoading = true">
</template>

<style scoped>
.theme-logo {
	width: v-bind(cssSize);
	height: v-bind(cssSize);
	object-fit: contain;
}
</style>
