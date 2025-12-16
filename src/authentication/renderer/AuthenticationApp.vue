<!--
  - SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup>
import { translate as t } from '@nextcloud/l10n'
import { computed, onMounted, ref } from 'vue'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcLoadingIcon from '@nextcloud/vue/components/NcLoadingIcon'
import NcTextField from '@nextcloud/vue/components/NcTextField'
import IconArrowRight from 'vue-material-design-icons/ArrowRight.vue'
import AppWindow from '../../shared/components/AppWindow.vue'
import { appData } from '../../app/AppData.js'
import { refetchAppData } from '../../app/appData.service.js'
import { MIN_REQUIRED_NEXTCLOUD_VERSION, MIN_REQUIRED_TALK_VERSION } from '../../constants.js'
import { BUILD_CONFIG } from '../../shared/build.config.ts'
import { getCapabilities } from '../../shared/ocs.service.js'

const channel = __CHANNEL__

const version = __VERSION_TAG__
const rawServerUrl = ref(BUILD_CONFIG.domain ?? '')
const enforceDomain = Boolean(BUILD_CONFIG.domain && BUILD_CONFIG.enforceDomain)

const serverUrl = computed(() => {
	const addHTTPS = (url) => url.startsWith('http') ? url : `https://${url}`
	const removeIndexPhp = (url) => url.includes('/index.php') ? url.slice(0, url.indexOf('/index.php')) : url
	const removeTrailingSlash = (url) => url.endsWith('/') ? url.slice(0, -1) : url
	return removeTrailingSlash(removeIndexPhp(addHTTPS(rawServerUrl.value))).trim()
})

/** @type {import('vue').Ref<'idle'|'loading'|'error'|'success'>} */
const state = ref('idle')
const stateText = ref('')

onMounted(() => {
	if (enforceDomain) {
		login()
	}
})

/**
 * Switch state to success
 */
function setSuccess() {
	state.value = 'success'
	stateText.value = t('talk_desktop', 'Logged in successfully')
}

/**
 * Switch state to loading
 */
function setLoading() {
	state.value = 'loading'
	stateText.value = ''
}

/**
 * Switch state to error
 *
 * @param {string} error - Error message
 */
function setError(error) {
	state.value = 'error'
	stateText.value = error
}

/**
 * Login
 */
async function login() {
	setLoading()

	// Only https:// is allowed
	if (serverUrl.value.startsWith('http://')) {
		return setError(t('talk_desktop', 'Connecting over http:// is not allowed'))
	}

	// Check if valid URL
	try {
		// new URL will throw an exception on invalid URL
		new URL(serverUrl.value)
	} catch {
		return setError(t('talk_desktop', 'Invalid server address'))
	}

	// Check the certificate before actually sending a request
	if (!await window.TALK_DESKTOP.verifyCertificate(serverUrl.value)) {
		return setError(t('talk_desktop', 'SSL certificate error'))
	}

	// Prepare to request the server
	window.TALK_DESKTOP.disableWebRequestInterceptor()
	appData.reset()
	appData.serverUrl = serverUrl.value

	// Check if there is Nextcloud server and get capabilities
	let capabilitiesResponse
	try {
		capabilitiesResponse = await getCapabilities(serverUrl.value)
	} catch {
		return setError(t('talk_desktop', 'Nextcloud server not found'))
	}

	// Check if Talk is installed and enabled
	const talkCapabilities = capabilitiesResponse.capabilities.spreed
	if (!talkCapabilities) {
		return setError(t('talk_desktop', 'Nextcloud Talk is not installed in the server'))
	}

	// Check versions compatibilities
	const createVersionError = (componentName, minRequiredVersion, foundVersion) => t('talk_desktop', '{componentName} {minRequiredVersion} or higher is required but {foundVersion} is installed', {
		componentName,
		minRequiredVersion,
		foundVersion,
	})
	if (capabilitiesResponse.version.major < MIN_REQUIRED_NEXTCLOUD_VERSION) {
		return setError(createVersionError('Nextcloud', MIN_REQUIRED_NEXTCLOUD_VERSION, capabilitiesResponse.version.string))
	}
	if (parseInt(talkCapabilities.version.split('.')[0]) < MIN_REQUIRED_TALK_VERSION) {
		// TODO: use semver package and check not only major version?
		return setError(createVersionError('Nextcloud Talk', MIN_REQUIRED_TALK_VERSION, talkCapabilities.version))
	}

	// Login with web view
	let credentials
	try {
		const maybeCredentials = await window.TALK_DESKTOP.openLoginWebView(serverUrl.value)
		if (maybeCredentials instanceof Error) {
			return setError(maybeCredentials.message)
		}
		credentials = maybeCredentials
	} catch (error) {
		console.error(error)
		return setError(t('talk_desktop', 'Unexpected error'))
	}

	// Add credentials to the request
	window.TALK_DESKTOP.enableWebRequestInterceptor(serverUrl.value, { credentials })
	// Save credentials
	appData.credentials = credentials

	// Get user's metadata and update capabilities for an authenticated user
	try {
		await refetchAppData(appData)
	} catch (error) {
		// A network connection was lost after successful requests or something unexpected went wrong
		console.error(error)
		return setError(t('talk_desktop', 'Login was successful but something went wrong.'))
	}

	// Yay!
	appData.persist()
	setSuccess()
	await window.TALK_DESKTOP.login(appData.toJSON())
}
</script>

<template>
	<AppWindow :title="t('talk_desktop', 'Authentication')" class="wrapper">
		<div class="spacer">
			<div class="logo" />
		</div>
		<div class="login-box">
			<form @submit.prevent="login">
				<fieldset :disabled="state === 'loading'">
					<h2 class="login-box__header">
						{{ t('talk_desktop', 'Log in to {applicationName}', { applicationName: BUILD_CONFIG.applicationName }) }}
					</h2>
					<NcTextField
						v-model="rawServerUrl"
						:label="!enforceDomain ? t('talk_desktop', 'Server address') : undefined"
						:aria-label="enforceDomain ? t('talk_desktop', 'Server address') : undefined"
						:label-visible="!enforceDomain"
						:input-class="{ 'login-box__server--predefined': enforceDomain }"
						:placeholder="!enforceDomain ? 'https://try.nextcloud.com' : undefined"
						inputmode="url"
						:readonly="enforceDomain"
						:success="state === 'success'"
						:error="state === 'error'"
						:helper-text="stateText" />
					<NcButton
						v-if="state !== 'loading'"
						class="submit-button"
						variant="primary"
						type="submit"
						wide>
						<template #icon>
							<IconArrowRight :size="20" />
						</template>
						{{ t('talk_desktop', 'Log in') }}
					</NcButton>
					<NcButton
						v-else-if="state === 'loading'"
						class="submit-button"
						variant="primary"
						type="submit"
						wide>
						<template #icon>
							<NcLoadingIcon appearance="light" />
						</template>
						{{ t('talk_desktop', 'Logging in …') }}
					</NcButton>
				</fieldset>
			</form>
		</div>
		<div class="spacer">
			<footer v-if="channel !== 'stable'" class="footer">
				{{ BUILD_CONFIG.applicationName }} {{ version }}
			</footer>
		</div>
	</AppWindow>
</template>

<style scoped>
.wrapper {
	display: flex;
	flex-direction: column;
	align-items: center;
	user-select: none;
	-webkit-app-region: drag;
}

.spacer {
	display: flex;
	flex: 1 0;
}

.logo {
	background: no-repeat center url('~../../../img/server-logo-plain.svg');
	background-size: contain;
	width: 175px;
	height: 130px;
	margin-top: auto;
}

.footer {
	margin-top: auto;
	margin-bottom: 2rem;
	color: var(--color-background-plain-text);
}

.login-box {
	color: var(--color-main-text);
	background-color: var(--color-main-background);
	padding: 16px;
	border-radius: var(--border-radius-large);
	box-shadow: 0 0 10px var(--color-box-shadow);
	width: 300px;
	-webkit-app-region: no-drag;
}

.login-box__header {
	text-align: center;
	margin-top: 0;
	font-size: 1.5em;
}

.submit-button {
	margin-top: 0.5rem;
}

:deep(.login-box__server--predefined) {
	border-color: transparent !important;
	background-color: transparent !important;
}
</style>
