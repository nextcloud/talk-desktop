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
	<div class="user-status-icon" :class="{ [status]: isDefaultStatusIcon }" />
</template>

<script>
export default {
	name: 'UserStatusIcon',

	props: {
		status: {
			type: String,
			default: '',
		},

		size: {
			type: Number,
			default: 16,
		},
	},

	computed: {
		isDefaultStatusIcon() {
			return ['online', 'away', 'dnd', 'invisible'].includes(this.status)
		},

		sizePx() {
			return this.size && `${this.size}px`
		},
	},
}
</script>

<style scoped>
.user-status-icon {
	width: v-bind(sizePx);
	height: v-bind(sizePx);
}

.user-status-icon.online {
	background-image: url('../assets/status-icons/user-status-online.svg');
}

.user-status-icon.dnd {
	background-image: url('../assets/status-icons/user-status-dnd.svg');
}

.user-status-icon.away {
	background-image: url('../assets/status-icons/user-status-away.svg');
}

.user-status-icon.invisible {
	background-image: url('../assets/status-icons/user-status-invisible.svg');
	filter: var(--background-invert-if-dark);
}
</style>
