<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<li class="menu-item">
		<component :is="tag" class="menu-item__action unstyled-action" v-bind="$attrs">
			<span v-if="$slots.icon" class="menu-item__icon">
				<slot name="icon" />
			</span>
			<span class="menu-item__text">
				<slot />
			</span>
		</component>
	</li>
</template>

<script>
import MdiWeb from 'vue-material-design-icons/Web.vue'
import MdiInformationOutline from 'vue-material-design-icons/InformationOutline.vue'

export default {
	name: 'UiMenuItem',

	components: {
		MdiInformationOutline,
		MdiWeb,
	},

	inheritAttrs: false,

	props: {
		tag: {
			type: [String, Object, Function],
			default: 'button',
		},
	},
}
</script>

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
	display: flex;
	align-items: center;
	border: none;
	border-radius: 6px; /* Same as NcActionButton */
	min-height: var(--default-clickable-area);
	padding: .5em var(--menu-item-gap);
	font-weight: normal;
	width: 100%;
	gap: var(--menu-item-gap);
	/* Override default global button styles */
	margin: 0 !important;
}

/*.menu-item__action:active,*/
.menu-item__action:hover,
.menu-item__action:focus {
	background-color: var(--color-background-hover);
}

.menu-item__icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px
}
</style>
