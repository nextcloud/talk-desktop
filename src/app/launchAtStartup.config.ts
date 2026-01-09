/*!
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { once } from '../shared/utils.ts'
import { getAppConfig, onAppConfigChange } from './AppConfig.ts'
import { isWindows } from './system.utils.ts'

/**
 * Get executable path for Windows's stub launcher in Squirrel and WiX MSI installations
 */
const getWindowsStubExecPath = once(() => {
	// TODO: when introducing MSIX installer, check if this needs to be updated

	/*
		<installation_folder>
		├─app-1.0.0
		│   └── Nextcloud Talk.exe
		│
		├─app-1.0.1
		│   └──"Nextcloud Talk.exe" <-- process.execPath
		│
		└─"Nextcloud Talk.exe" <-- Stub launcher
	*/

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
	// In development Electron executable is used instead which is not suitable for launch at startup
	// This feature should only be tested in a production build and installation
	if (process.env.NODE_ENV !== 'production') {
		console.warn('Launch at startup config is disabled in development mode, test and debug in the production build.')
		return
	}

	const launchAtStartup = getAppConfig('launchAtStartup')
	const launchAtStartupInBackground = getAppConfig('launchAtStartupInBackground')

	console.info('Setting launch at startup to ', launchAtStartup, launchAtStartup ? (launchAtStartupInBackground ? 'in background' : 'in foreground') : '')

	// Windows: registry key HKCU\Software\Microsoft\Windows\CurrentVersion\Run
	// macOS 13+: SMAppService (System Settings / General / Login Items)
	// Older macOS: ~/Library/Preferences/com.apple.loginitems.plist
	app.setLoginItemSettings({
		openAtLogin: launchAtStartup,
		name: app.getName(),
		args: launchAtStartupInBackground ? ['--background'] : [],
		path: isWindows ? getWindowsStubExecPath() : undefined,
	})
}

/**
 * Initialize the listener for the launch at startup configurations
 */
export function initLaunchAtStartupListener() {
	onAppConfigChange('launchAtStartup', applyLaunchAtStartup)
	onAppConfigChange('launchAtStartupInBackground', applyLaunchAtStartup)
}
