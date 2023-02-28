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
				<fieldset :disabled="state === 'loading'">
					<h2 class="login-box__header">
						Login to Nextcloud
					</h2>
					<NcTextField label="Nextcloud server URL"
						:label-visible="true"
						:value.sync="serverUrl"
						placeholder="https://"
						type="url"
						:success="state === 'success'"
						:error="state === 'error'"
						:helper-text="stateText"
					/>
					<NcButton v-if="state !== 'loading'"
						class="submit-button"
						type="primary"
						native-type="submit"
						wide>
						Log in
					</NcButton>
					<NcButton v-else-if="state ==='loading'"
						class="submit-button"
						type="primary"
						native-type="submit"
						wide>
						<template #icon>
							<NcLoadingIcon appearance="light" />
						</template>
						Logging in...
					</NcButton>
				</fieldset>
			</form>
		</div>
		<div class="spacer">
			<footer class="footer">
				Talk Desktop {{ version }}
			</footer>
		</div>
	</div>
</template>

<script>
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import NcLoadingIcon from '@nextcloud/vue/dist/Components/NcLoadingIcon.js'
import NcTextField from '@nextcloud/vue/dist/Components/NcTextField.js'
import { getCapabilities, getCurrentUserData } from '../../shared/ocs.service.js'
import { appData } from '../../app/AppData.js'
import packageJson from '../../../package.json'

export default {
	name: 'WindowAccounts',

	components: {
		NcButton,
		NcLoadingIcon,
		NcTextField,
	},

	setup() {
		return {
			version: packageJson.version,
		}
	},

	data() {
		return {
			serverUrl: process.env.NODE_ENV !== 'production' ? 'https://nextcloud.local' : '',
			/** @type {'idle'|'loading'|'error'|'success'} */
			state: 'idle',
			stateText: '',
		}
	},

	methods: {
		setSuccess() {
			this.state = 'success'
			this.stateText = 'Login successfully'
		},

		setLoading() {
			this.state = 'loading'
		},

		setError(error) {
			this.state = 'error'
			this.stateText = error
		},

		async login() {
			this.setLoading()

			// Prepare to request the server
			window.TALK_DESKTOP.disableWebRequestInterceptor()
			window.TALK_DESKTOP.enableWebRequestInterceptor(this.serverUrl, { enableCors: true })
			appData.reset()
			appData.serverUrl = this.serverUrl

			// Check the server
			try {
				const capabilities = await getCapabilities()
				const talkCapabilities = capabilities.capabilities.spreed
				if (!talkCapabilities) {
					return this.setError('Talk is not enabled on this server')
				}
				// TODO: use semver package?
				if (parseInt(talkCapabilities.version.split('.')[0]) < 16) {
					return this.error('Talk Desktop requires Talk v16 or higher')
				}
				appData.version.nextcloud = capabilities.version
				appData.version.talk = talkCapabilities.version
				appData.version.desktop = this.version
			} catch {
				return this.setError('Server URL is not correct')
			}

			// Login with web view
			try {
				const maybeCredentials = await window.TALK_DESKTOP.openLoginWebView(this.serverUrl)
				if (maybeCredentials instanceof Error) {
					return this.setError(maybeCredentials.message)
				}
				appData.credentials = maybeCredentials
			} catch (error) {
				console.error(error)
				return this.setError('Unexpected error')
			}

			// Get UserMetadata
			try {
				appData.userMetadata = await getCurrentUserData()
				// Update capabilities for authenticated user
				const capabilitiesResponse = await getCapabilities()
				appData.capabilities = capabilitiesResponse.capabilities
				// Save all AppData
				appData.persist()
				// Bye
				this.setSuccess()
				window.TALK_DESKTOP.login()
			} catch (error) {
				console.error(error)
				return this.setError('Error... Try again...')
			}
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
