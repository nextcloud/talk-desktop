/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { app, nativeTheme } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getAppConfig } from '../app/AppConfig.ts'
import { isLinux, platform } from '../app/system.utils.ts'

const icons = {
	// Executable's icon is used by default
	window: {
		linux: fileURLToPath(new URL('../../img/icons/icon.png', import.meta.url)),
	},

	tray: {
		darwin: {
			// "*Template" icon in the system tray on macOS automatically changes its color by system
			default: fileURLToPath(new URL('../../img/icons/IconTrayMac.png', import.meta.url)),
			light: fileURLToPath(new URL('../../img/icons/IconTrayMacTemplate.png', import.meta.url)),
			dark: fileURLToPath(new URL('../../img/icons/IconTrayMacTemplate.png', import.meta.url)),
			// These properties are not used, but the import is required to add the icon to the bundle
			// It will be used by electron internally
			default2x: fileURLToPath(new URL('../../img/icons/IconTrayMac@2x.png', import.meta.url)),
			light2x: fileURLToPath(new URL('../../img/icons/IconTrayMacTemplate@2x.png', import.meta.url)),
			dark2x: fileURLToPath(new URL('../../img/icons/IconTrayMacTemplate@2x.png', import.meta.url)),
		},

		win32: {
			default: fileURLToPath(new URL('../../img/icons/IconTrayWin32.ico', import.meta.url)),
			light: fileURLToPath(new URL('../../img/icons/IconTrayWin32Light.ico', import.meta.url)),
			dark: fileURLToPath(new URL('../../img/icons/IconTrayWin32Dark.ico', import.meta.url)),
		},

		linux: {
			default: fileURLToPath(new URL('../../img/icons/IconTrayLinux.png', import.meta.url)),
			light: fileURLToPath(new URL('../../img/icons/IconTrayLinuxLight.png', import.meta.url)),
			dark: fileURLToPath(new URL('../../img/icons/IconTrayLinuxDark.png', import.meta.url)),
		},
	},
}

/**
 * Get tray icon
 */
export function getTrayIcon() {
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
export function getBrowserWindowIcon() {
	if (isLinux) {
		// https://www.electronforge.io/guides/create-and-add-icons#linux
		return path.join(app.getAppPath(), '.webpack/main', icons.window.linux)
	}

	return undefined
}
