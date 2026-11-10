/*!
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { once } from '../shared/utils.ts'
import { getAppConfig, onAppConfigChange } from './AppConfig.ts'
import { isMac, isWindows } from './system.utils.ts'

/**
 * Get executable path for Windows's stub launcher in Squirrel and WiX MSI installations.
 * This is the path to the actual executable the app is supposed to be started from when available.
 *
 * <installation_folder>
 * ├─app-1.0.0
 * │   └── "Nextcloud Talk.exe"
 * │
 * ├─app-1.0.1
 * │   └──"Nextcloud Talk.exe" <-- process.execPath
 * │
 * └─"Nextcloud Talk.exe" <-- Stub launcher
 *
 * @todo When introducing MSIX installer, check if this needs to be updated
 */
const getWindowsStubExecPath = once(() => {
	const stubExecPath = path.resolve(path.dirname(process.execPath), '..', path.basename(process.execPath))
	if (fs.existsSync(stubExecPath)) {
		return stubExecPath
	}

	// Probably this is not a Squirrel or WiX MSI installation
	// Fallback to the current executable path
	return process.execPath
})

/**
 * Set the application to launch at startup according to the configuration
 */
function applyLaunchAtStartup() {
	// In development, app runs through Electron's executable, which is not suitable for launch at startup
	// This feature should only be tested with production build installation
	if (process.env.NODE_ENV !== 'production') {
		console.warn('Launch at startup config is disabled in development mode. Please, test and debug in the production build.')
		return
	}

	const launchAtStartup = getAppConfig('launchAtStartup')
	const launchAtStartupInBackground = getAppConfig('launchAtStartupInBackground')

	console.info('Setting launch at startup to ', launchAtStartup, launchAtStartup ? (launchAtStartupInBackground ? 'in background' : 'in foreground') : '')

	if (isWindows) {
		app.setLoginItemSettings({
			// Adds registry item in HKCU\Software\Microsoft\Windows\CurrentVersion\Run
			// Adds the app to the "Task Manager / Startup Apps" settings (also Settings / Apps / Startup)
			openAtLogin: true,
			// Toggles registry item in HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run
			// Defines the "Task Manager / Startup Apps" toggle setting value (also Settings / Apps / Startup)
			enabled: launchAtStartup,
			// Use application name as the entry name to share a single entry across multiple distributions (.exe, .msi) ensuring a single instance startup
			name: app.getName(),
			path: getWindowsStubExecPath(),
			args: launchAtStartupInBackground ? ['--background'] : [],
		})
		return
	}

	if (isMac) {
		// macOS 13+: SMAppService (System Settings / General / Login Items)
		// Older macOS: ~/Library/Preferences/com.apple.loginitems.plist
		app.setLoginItemSettings({ openAtLogin: launchAtStartup })
		return
	}
}

/**
 * Initialize the listener for the launch at startup configurations
 */
export function initLaunchAtStartupListener() {
	onAppConfigChange('launchAtStartup', applyLaunchAtStartup)
	onAppConfigChange('launchAtStartupInBackground', applyLaunchAtStartup)
}
