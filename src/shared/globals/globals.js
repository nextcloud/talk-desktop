/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { ref } from 'vue'

import { loadState } from '@nextcloud/initial-state'
import { translate, translatePlural } from '@nextcloud/l10n'

import { appData } from '../../app/AppData.js'
import { dialogs } from './OC/dialogs.js'
import { MimeTypeList } from './OC/mimetype.js'
import { getDesktopMediaSource } from '../../talk/renderer/getDesktopMediaSource.js'

let enabledAbsoluteWebroot = false

/**
 * Run a function with an absolute webroot enabled to not rely on window.location
 *
 * @param {Function} func - the function to run
 * @param {...any} args - the arguments to pass to the function
 * @return {any} the result of the function's run
 */
function runWithAbsoluteWebroot(func, ...args) {
	enabledAbsoluteWebroot = true
	const result = func.call(this, ...args)
	enabledAbsoluteWebroot = false
	return result
}

const getMaybeAbsoluteWebroot = () => enabledAbsoluteWebroot ? appData.serverUrl : new URL(appData.serverUrl).pathname

const OC = {
	// Constant from: https://github.com/nextcloud/server/blob/master/core/src/OC/constants.js
	coreApps: ['', 'admin', 'log', 'core/search', 'core', '3rdparty'],

	// For sounds loading
	appswebroots: {
		spreed: '/apps/spreed',
	},

	MimeTypeList,
	MimeType: {
		// TODO: better to move this function from global to @nextcloud/files or @nextcloud/router
		getIconUrl(mimeType) {
			if (!mimeType) {
				return undefined
			}

			while (MimeTypeList.aliases[mimeType]) {
				mimeType = MimeTypeList.aliases[mimeType]
			}

			let icon = mimeType.replaceAll('/', '-')
			icon = MimeTypeList.files.includes(icon) ? icon : mimeType.split('/')[0]

			try {
				return require(`@shgk/nextcloud-styles/core/img/filetypes/${icon}.svg`)
			} catch {
				return undefined
			}
		},
	},

	isUserAdmin() {
		return appData.userMetadata?.groups?.includes('admin')
	},

	get webroot() {
		return getMaybeAbsoluteWebroot()
	},

	config: {
		// The capability's been available since Nextcloud 29
		// For older versions, consider it disabled and always add index.php to URLs
		get modRewriteWorking() {
			return appData.capabilities?.core?.['mod-rewrite-working'] ?? false
		},
	},

	dialogs,

	theme: {
		get productName() {
			return loadState('theming', 'data').name
		},
	},

	getHost() {
		return new URL(appData.serverUrl).host
	},

	getHostname() {
		return new URL(appData.serverUrl).hostname
	},

	getProtocol() {
		return new URL(appData.serverUrl).protocol
	},

	getPort() {
		return new URL(appData.serverUrl).port
	},
}

const OCA = {
	Talk: {
		Desktop: {
			getDesktopMediaSource,
			runWithAbsoluteWebroot,
			enabledAbsoluteWebroot: false,
			talkRouter: ref(null),
		},
	},
}

const OCP = {
	Accessibility: {
		disableKeyboardShortcuts: () => {},
	},
}

/**
 * Init global variables similar to Server
 */
export function initGlobals() {
	window.t = translate
	window.n = translatePlural

	window.OC = OC
	window.OCA = OCA
	window.OCP = OCP

	Object.defineProperty(window, '_oc_webroot', {
		get: () => getMaybeAbsoluteWebroot(),
	})

	Object.defineProperty(window, '_oc_appswebroots', {
		get: () => window.OC.appswebroots,
	})
}
