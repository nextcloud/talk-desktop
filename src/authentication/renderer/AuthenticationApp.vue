<!--
  - @copyright Copyright (c) 2022 Grigorii Shartsev <me@shgk.me>
  -
  - @author Grigorii Shartsev <me@shgk.me>
  -
  - @license AGPL-3.0-or-later
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
						Log in to Nextcloud
					</h2>
					<NcTextField label="Nextcloud server address"
						label-visible
						:value.sync="rawServerUrl"
						placeholder="https://try.nextcloud.com"
						inputmode="url"
						:success="state === 'success'"
						:error="state === 'error'"
						:helper-text="stateText" />
					<NcButton v-if="state !== 'loading'"
						class="submit-button"
						type="primary"
						native-type="submit"
						wide>
						<template #icon>
							<MdiArrowRight :size="20" />
						</template>
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
				Nextcloud Talk Desktop {{ version }}
			</footer>
		</div>
	</div>
</template>

<script>
import MdiArrowRight from 'vue-material-design-icons/ArrowRight.vue'
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import NcLoadingIcon from '@nextcloud/vue/dist/Components/NcLoadingIcon.js'
import NcTextField from '@nextcloud/vue/dist/Components/NcTextField.js'
import { getCapabilities, getCurrentUserData } from '../../shared/ocs.service.js'
import { appData } from '../../app/AppData.js'
import { MIN_REQUIRED_NEXTCLOUD_VERSION, MIN_REQUIRED_TALK_VERSION } from '../../constants.js'
import { refetchAppData } from '../../app/appData.service.js'

export default {
	name: 'AuthenticationApp',

	components: {
		MdiArrowRight,
		NcButton,
		NcLoadingIcon,
		NcTextField,
	},

	setup() {
		return {
			version: window.TALK_DESKTOP.packageInfo.version,
		}
	},

	data() {
		return {
			rawServerUrl: process.env.NODE_ENV !== 'production' ? process.env.NEXTCLOUD_DEV_SERVER_HOSTS?.split?.(' ')?.[0] : '',
			/** @type {'idle'|'loading'|'error'|'success'} */
			state: 'idle',
			stateText: '',
		}
	},

	computed: {
		serverUrl() {
			const addHTTPS = (url) => url.startsWith('http') ? url : `https://${url}`
			const removeIndexPhp = (url) => url.includes('/index.php') ? url.slice(0, url.indexOf('/index.php')) : url
			const removeTrailingSlash = (url) => url.endsWith('/') ? url.slice(0, -1) : url
			return removeTrailingSlash(removeIndexPhp(addHTTPS(this.rawServerUrl))).trim()
		},
	},

	methods: {
		setSuccess() {
			this.state = 'success'
			this.stateText = 'Logged in successfully'
		},

		setLoading() {
			this.state = 'loading'
			this.stateText = ''
		},

		setError(error) {
			this.state = 'error'
			this.stateText = error
		},

		async login() {
			this.setLoading()

			// Check if valid URL
			try {
				// new URL will throw an exception on invalid URL
				// eslint-disable-next-line no-new
				new URL(this.serverUrl)
			} catch {
				return this.setError('Invalid server address')
			}

			// Prepare to request the server
			window.TALK_DESKTOP.disableWebRequestInterceptor()
			window.TALK_DESKTOP.enableWebRequestInterceptor(this.serverUrl, { enableCors: true })
			appData.reset()
			appData.serverUrl = this.serverUrl
			appData.version.desktop = this.version

			// Check if there is Nextcloud server and get capabilities
			let capabilitiesResponse
			try {
				capabilitiesResponse = await getCapabilities()
			} catch {
				return this.setError('Nextcloud server not found')
			}

			// Check if Talk is installed and enabled
			const talkCapabilities = capabilitiesResponse.capabilities.spreed
			if (!talkCapabilities) {
				return this.setError('Nextcloud Talk is not installed in the server')
			}

			// Check versions compatibilities
			if (capabilitiesResponse.version.major < MIN_REQUIRED_NEXTCLOUD_VERSION) {
				return this.setError(`Nextcloud ${MIN_REQUIRED_NEXTCLOUD_VERSION} or higher is required but ${capabilitiesResponse.version.string} is installed`)
			}
			if (parseInt(talkCapabilities.version.split('.')[0]) < MIN_REQUIRED_TALK_VERSION) {
				// TODO: use semver package and check not only major version?
				return this.setError(`Nextcloud Talk ${MIN_REQUIRED_TALK_VERSION} or higher is required but ${talkCapabilities.version} is installed`)
			}

			// Login with web view
			let credentials
			try {
				const maybeCredentials = await window.TALK_DESKTOP.openLoginWebView(this.serverUrl)
				if (maybeCredentials instanceof Error) {
					return this.setError(maybeCredentials.message)
				}
				credentials = maybeCredentials
			} catch (error) {
				console.error(error)
				return this.setError('Unexpected error')
			}

			// Add credentials to the request
			window.TALK_DESKTOP.enableWebRequestInterceptor(this.serverUrl, { enableCors: true, enableCookies: true, credentials })
			// Save credentials
			appData.credentials = credentials

			// Get user's metadata and update capabilities for an authenticated user
			try {
				await refetchAppData(appData)
			} catch (error) {
				// A network connection was lost after successful requests or something unexpected went wrong
				console.error(error)
				return this.setError('Login was successful but something went wrong...')
			}

			// Yay!
			appData.persist()
			this.setSuccess()
			await window.TALK_DESKTOP.login()
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
