<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { Component } from 'vue'

defineOptions({
	inheritAttrs: false,
})

const { tag = 'button' as string | Component } = defineProps<{
	tag?: string | Component
}>()
</script>

<template>
	<li class="menu-item">
		<component :is="tag" class="menu-item__action unstyled-action" v-bind="$attrs">
			<span class="menu-item__action-content">
				<span v-if="$slots.icon" class="menu-item__icon">
					<slot name="icon" />
				</span>
				<span class="menu-item__text">
					<slot />
				</span>
				<span v-if="$slots['action-icon']" class="menu-item__action-icon">
					<slot name="action-icon" />
				</span>
			</span>
		</component>
	</li>
</template>

<style scoped>
.unstyled-action {
	border: none;
	padding: 0;
	margin: 0;
	text-decoration: none;
	background-color: inherit;
}

.menu-item__action {
	--menu-item-icon-size: 20px;
	--menu-item-gap: calc((var(--default-clickable-area) - var(--menu-item-icon-size)) / 2);
	border: none;
	border-radius: 6px; /* Same as NcActionButton */
	display: block;
	min-height: var(--default-clickable-area);
	padding: .5em var(--menu-item-gap);
	text-align: start;
	font-weight: normal;
	width: 100%;
	/* Override default global button styles */
	margin: 0 !important;
	color: var(--color-main-text);
}

/*.menu-item__action:active,*/
.menu-item__action:hover,
.menu-item__action:focus {
	background-color: var(--color-background-hover);
}

.menu-item__action-content {
	display: flex;
	align-items: center;
	gap: var(--menu-item-gap);
}

.menu-item__icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 24px;
}

.menu-item__text {
	flex: 1;
	word-break: break-word;
}
</style>
