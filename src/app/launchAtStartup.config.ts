/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { app } from 'electron'
import { getAppConfig, onAppConfigChange } from './AppConfig.ts'

/**
 * Set the application to launch at startup according to the configuration
 */
function applyLaunchAtStartup() {
	// Do not add the app to startup in development mode
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
	})
}

/**
 * Initialize the listener for the launch at startup configurations
 */
export function initLaunchAtStartupListener() {
	onAppConfigChange('launchAtStartup', applyLaunchAtStartup)
	onAppConfigChange('launchAtStartupInBackground', applyLaunchAtStartup)
}
