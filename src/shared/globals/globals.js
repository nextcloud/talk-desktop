/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { loadState } from '@nextcloud/initial-state'
import { translate, translatePlural } from '@nextcloud/l10n'
import { appData } from '../../app/AppData.js'
import { getDesktopMediaSource } from '../../talk/renderer/screensharing/screensharing.module.ts'
import { dialogs } from './OC/dialogs.js'
import { MimeTypeList } from './OC/mimetype.js'

let webroot = ''

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
			const defaultFileIcon = require('@global-styles/core/img/filetypes/file.svg')

			if (!mimeType) {
				return defaultFileIcon
			}

			while (MimeTypeList.aliases[mimeType]) {
				mimeType = MimeTypeList.aliases[mimeType]
			}

			let icon = mimeType.replaceAll('/', '-')
			icon = MimeTypeList.files.includes(icon) ? icon : mimeType.split('/')[0]

			try {
				return require(`@global-styles/core/img/filetypes/${icon}.svg`)
			} catch {
				return defaultFileIcon
			}
		},
	},

	isUserAdmin() {
		return appData.userMetadata?.groups?.includes('admin')
	},

	get webroot() {
		return webroot
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

	webroot = appData.serverUrl ? new URL(appData.serverUrl).pathname.replace(/\/$/, '') : ''

	Object.defineProperty(window, '_oc_webroot', {
		get: () => webroot,
	})

	Object.defineProperty(window, '_oc_appswebroots', {
		get: () => window.OC.appswebroots,
	})
}
