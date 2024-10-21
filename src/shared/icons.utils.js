/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { app, nativeTheme } = require('electron')
const { isLinux } = require('./os.utils.js')
const path = require('path')

const icons = {
	// Executable's icon is used by default
	window: {
		linux: require('../../img/icons/icon.png'),
	},

	tray: {
		darwin: {
			light: require('../../img/icons/icon-tray-mac-light.png'),
			dark: require('../../img/icons/icon-tray-mac-dark.png'),
		},

		// This property is not used, but import is required to add the icon to the bundle.
		// It will be used by electron internally
		darwin_x2: {
			light: require('../../img/icons/icon-tray-mac-light@2x.png'),
			dark: require('../../img/icons/icon-tray-mac-dark@2x.png'),
		},

		win32: require('../../img/icons/icon.ico'),

		linux: require('../../img/icons/icon-tray-linux.png'),
	},
}

/**
 * Get tray icon for the given platform
 *
 * @param {'darwin'|'win32'|'cygwin'|string} [platform] platform otherwise current process.platform is used
 */
function getTrayIcon(platform) {
	switch (platform ?? process.platform) {
	case 'darwin':
		return nativeTheme.shouldUseDarkColors ? icons.tray.darwin.dark : icons.tray.darwin.light
	case 'win32':
		return icons.tray.win32
	default:
		return icons.tray.linux
	}
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
