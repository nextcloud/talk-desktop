<!--
  - @copyright Copyright (c) 2022 Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
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
	<div class="wrapper">
		<div class="spacer">
			<div class="logo" />
		</div>
		<div class="login-box">
			<form @submit.prevent="login">
				<h2 class="login-box__header">
					Login to Nextcloud
				</h2>
				<NcTextField label="Nextcloud server URL"
					:label-visible="true"
					:value.sync="serverUrl"
					placeholder="https://..."
					type="url" />
				<NcButton class="submit-button"
					type="primary"
					native-type="submit"
					wide>
					Log in
				</NcButton>
			</form>
		</div>
		<div class="spacer">
			<footer class="footer">
				Talk Desktop {{ $options.version }}
			</footer>
		</div>
	</div>
</template>

<script>
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import NcTextField from '@nextcloud/vue/dist/Components/NcTextField.js'
import packageJson from '../../../package.json'

export default {
	name: 'WindowAccounts',

	version: packageJson.version,

	components: {
		NcButton,
		NcTextField,
	},

	data() {
		return {
			serverUrl: process.env.NODE_ENV !== 'production' ? 'https://nextcloud.local' : '',
		}
	},

	methods: {
		async login() {
			const credentials = await window.TALK_DESKTOP.login(this.serverUrl)
			window.localStorage.setItem('credentials', JSON.stringify(credentials))
			window.close()
		},
	},
}
</script>

<style scoped>
.wrapper {
	height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	user-select: none;
}

.spacer {
	display: flex;
	flex: 1 0;
}

.logo {
	background: no-repeat center url('../../shared/assets/default/img/logo/logo.svg');
	background-size: contain;
	width: 175px;
	height: 130px;
	margin-top: auto;
}

.footer {
	margin-top: auto;
	margin-bottom: 2rem;
}

.login-box {
	color: var(--color-main-text);
	background-color: var(--color-main-background);
	padding: 16px;
	border-radius: var(--border-radius-large);
	box-shadow: 0 0 10px var(--color-box-shadow);
	width: 300px;
}

.login-box__header {
	text-align: center;
}

.submit-button {
	margin-top: 0.5rem;
}
</style>
