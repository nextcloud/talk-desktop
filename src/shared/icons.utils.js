/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { app, nativeTheme } = require('electron')
const { isLinux, getPlatform } = require('./os.utils.js')
const path = require('path')
const { getAppConfig } = require('../app/AppConfig.ts')

const icons = {
	// Executable's icon is used by default
	window: {
		linux: require('../../img/icons/icon.png'),
	},

	tray: {
		darwin: {
			// "*Template" icon in the system tray on macOS automatically changes its color by system
			default: require('../../img/icons/icon-tray-mac.png'),
			light: require('../../img/icons/IconTrayMacTemplate.png'),
			dark: require('../../img/icons/IconTrayMacTemplate.png'),
			// These properties are not used, but the import is required to add the icon to the bundle
			// It will be used by electron internally
			default2x: require('../../img/icons/icon-tray-mac@2x.png'),
			light2x: require('../../img/icons/IconTrayMacTemplate@2x.png'),
			dark2x: require('../../img/icons/IconTrayMacTemplate@2x.png'),
		},

		win32: {
			default: require('../../img/icons/icon.ico'),
			light: require('../../img/icons/icon-tray-win32-light.ico'),
			dark: require('../../img/icons/icon-tray-win32-dark.ico'),
		},

		linux: {
			default: require('../../img/icons/icon-tray-linux.png'),
			light: require('../../img/icons/icon-tray-linux-light@2x.png'),
			dark: require('../../img/icons/icon-tray-linux-dark@2x.png'),
		},
	},
}

/**
 * Get tray icon
 */
function getTrayIcon() {
	const platform = getPlatform()
	const monochrome = getAppConfig('monochromeTrayIcon')
	const theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
	const kind = monochrome ? theme : 'default'

	return icons.tray[platform][kind]
}

/**
 * Get BrowserWindow icon for the current platform
 *
 * @return {string|undefined} Path to the icon or undefined if not required on the current platform
 */
function getBrowserWindowIcon() {
	if (isLinux()) {
		// https://www.electronforge.io/guides/create-and-add-icons#linux
		return path.join(app.getAppPath(), '.webpack/main', icons.window.linux)
	}

	return undefined
}

module.exports = {
	getTrayIcon,
	getBrowserWindowIcon,
}
