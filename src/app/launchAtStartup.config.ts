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
		return
	}

	const launchAtStartup = getAppConfig('launchAtStartup')

	console.log('Setting launch at startup to:', launchAtStartup)
	app.setLoginItemSettings({
		openAtLogin: launchAtStartup,
		name: app.getName(),
		args: [
			// Open in the background (hidden to the system tray) on Windows
			'--background',
		],
	})
}

/**
 * Initialize the listener for the launch at startup configuration
 */
export function initLaunchAtStartupListener() {
	onAppConfigChange('launchAtStartup', applyLaunchAtStartup)
}
