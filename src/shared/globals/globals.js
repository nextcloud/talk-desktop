/*
 * @copyright Copyright (c) 2024 Grigorii Shartsev <me@shgk.me>
 *
 * @author Grigorii Shartsev <me@shgk.me>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import { loadState } from '@nextcloud/initial-state'
import { translate, translatePlural } from '@nextcloud/l10n'

import { appData } from '../../app/AppData.js'
import { dialogs } from './OC/dialogs.js'
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

	// TODO: Add OC.MimeType
	MimeType: {
		getIconUrl() {
			return undefined
		},
	},

	isUserAdmin() {
		return appData.userMetadata?.groups?.includes('admin')
	},

	get webroot() {
		return getMaybeAbsoluteWebroot()
	},

	config: {
		// TODO: It works in any case, but may make links with redundant index.php. Should get actual value of modRewriteWorking?
		modRewriteWorking: false,
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
