<!--
  - @copyright Copyright (c) 2023 Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
  -
  - @author Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
  -
  - @license GNU AGPL version 3 or any later version
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
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
