<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup>
import { t } from '@nextcloud/l10n'
import { computed } from 'vue'
import NcEmptyContent from '@nextcloud/vue/components/NcEmptyContent'
import NcLoadingIcon from '@nextcloud/vue/components/NcLoadingIcon'
import IconAlertCircleOutline from 'vue-material-design-icons/AlertCircleOutline.vue'

const props = defineProps({
	loading: {
		type: Boolean,
		required: false,
		default: false,
	},
	error: {
		type: [Boolean, String],
		required: false,
		default: false,
	},
	/**
	 * In lazy mode the content is rendered visually hidden during loading.
	 * Used when loading happens on rendering, for example, loading <img>.
	 */
	lazy: {
		type: Boolean,
		required: false,
	},
})

const readyToShow = computed(() => !props.loading && !props.error)
</script>

<template>
	<div class="viewer-wrapper">
		<NcEmptyContent
			v-if="loading"
			:name="t('talk_desktop', 'Loading …')"
			class="viewer-wrapper__empty-content delayed-appear"
			data-theme-dark>
			<template #icon>
				<NcLoadingIcon />
			</template>
		</NcEmptyContent>

		<NcEmptyContent
			v-else-if="error"
			:name="t('talk_desktop', 'Could not load the file')"
			:description="typeof error === 'string' ? error : undefined"
			class="viewer-wrapper__empty-content"
			data-theme-dark>
			<template #icon>
				<IconAlertCircleOutline />
			</template>
		</NcEmptyContent>

		<div v-if="lazy || readyToShow" class="viewer-wrapper__content" :class="{ 'hidden-visually': lazy && !readyToShow }">
			<slot />
		</div>
	</div>
</template>

<style scoped>
.viewer-wrapper {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
}

.viewer-wrapper__empty-content {
	/* Explicitly set color to apply theme override */
	color: var(--color-main-text);
}

.viewer-wrapper__content {
	width: 100%;
	height: 100%;
}

.viewer-wrapper__content > :deep(*) {
	width: 100%;
	height: 100%;
}

@keyframes delayed-appear {
	0% {
		opacity: 0;
	}
	100% {
		opacity: 1;
	}
}

.delayed-appear {
	opacity: 0;
	animation: delayed-appear 0s forwards;
	animation-delay: var(--animation-slow);
}
</style>
