/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { app, webContents } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { isLinux, isMac } from './system.utils.ts'

const APP_CONFIG_FILE_NAME = 'config.json'

// Memoize the path to the application config file
let APP_CONFIG_FILE_PATH: string | null = null

/**
 * Get the path to the application config file
 * - Windows: C:\Users\<username>\AppData\Roaming\Nextcloud Talk\config.json
 * - Linux: ~/.config/Nextcloud Talk/config.json (or $XDG_CONFIG_HOME)
 * - macOS: ~/Library/Application Support/Nextcloud Talk/config.json
 */
function getAppConfigFilePath() {
	if (!APP_CONFIG_FILE_PATH) {
		APP_CONFIG_FILE_PATH = join(app.getPath('userData'), APP_CONFIG_FILE_NAME)
	}
	return APP_CONFIG_FILE_PATH
}

/**
 * Application level config. Applied to all accounts and persist on re-login.
 * Stored in the application data directory.
 */
export type AppConfig = {
	// ----------------
	// General settings
	// ----------------

	/**
	 * Whether to launch the application at startup
	 * Default: false
	 */
	launchAtStartup: boolean

	// -------------------
	// Appearance settings
	// -------------------

	/**
	 * Application theme.
	 * Default: 'default' to follow the system theme.
	 */
	theme: 'default' | 'dark' | 'light'
	/**
	 * Whether to use a custom title bar or the system default.
	 * Default: true on Linux, false otherwise.
	 */
	systemTitleBar: boolean
	/**
	 * Whether to use a monochrome tray icon.
	 * Default: true on macOS, false otherwise.
	 */
	monochromeTrayIcon: boolean
	/**
	 * Zoom factor of the application.
	 * Default: 1.
	 */
	zoomFactor: number

	// ----------------
	// Privacy settings
	// ----------------

	// Nothing yet...

	// ----------------------
	// Notifications settings
	// ----------------------

	/**
	 * Whether to play a sound when a chat notification is received.
	 * Same as notifications.sound_notification initial state.
	 * - 'always': always play sound
	 * - 'respect-dnd': play sound only if user status is not Do-Not-Disturb [default]
	 * - 'never': disable notification sound
	 */
	playSoundChat: 'always' | 'respect-dnd' | 'never'
	/**
	 * Whether to play a sound when a call notification is received.
	 * Same as notifications.sound_talk initial state.
	 * - 'always': always play sound
	 * - 'respect-dnd': play sound only if user status is not Do-Not-Disturb [default]
	 * - 'never': disable notification sound
	 */
	playSoundCall: 'always' | 'respect-dnd' | 'never'
	/**
	 * Whether to show a popup when a call notification is received.
	 * - 'always': always show the popup
	 * - 'respect-dnd': show the popup only if user status is not Do-Not-Disturb [default]
	 * - 'never': disable the call popup
	 */
	enableCallbox: 'always' | 'respect-dnd' | 'never'
	/**
	 * Whether to play ring sound on secondary speaker when a call notification is received.
	 */
	secondarySpeaker: boolean
	/**
	 * Device ID of secondary speaker output device.
	 */
	secondarySpeakerDevice: string | null
	/**
	 * List of trusted certificate fingerprints on Linux
	 */
	trustedFingerprints: string[]
}

export type AppConfigKey = keyof AppConfig

/**
 * Get the default config
 */
const defaultAppConfig: AppConfig = {
	launchAtStartup: false,
	theme: 'default',
	systemTitleBar: isLinux,
	monochromeTrayIcon: isMac,
	zoomFactor: 1,
	playSoundChat: 'respect-dnd',
	playSoundCall: 'respect-dnd',
	enableCallbox: 'respect-dnd',
	secondarySpeaker: false,
	secondarySpeakerDevice: null,
	trustedFingerprints: [],
}

/** Local cache of the config file mixed with the default values */
const appConfig: Partial<AppConfig> = {}
/** Whether the application config has been read from the config file and ready to use */
let initialized = false
/**
 * Listeners for application config changes
 */
const appConfigChangeListeners: { [K in AppConfigKey]?: Set<(value: AppConfig[K]) => void> } = {}

/**
 * Read the application config from the file
 */
async function readAppConfigFile(): Promise<Partial<AppConfig>> {
	try {
		const content = await readFile(getAppConfigFilePath(), 'utf-8')
		return JSON.parse(content)
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code !== 'ENOENT') {
			console.error('Failed to read the application config file', error)
		}
		// No file or invalid file - no custom config
		return {}
	}
}

/**
 * Write the application config to the config file
 *
 * @param config - The config to write
 */
async function writeAppConfigFile(config: Partial<AppConfig>) {
	try {
		// Format for readability
		const content = JSON.stringify(config, null, 2)
		await writeFile(getAppConfigFilePath(), content)
	} catch (error) {
		console.error('Failed to write the application config file', error)
		throw error
	}
}

/**
 * Load the application config into the application memory
 */
export async function loadAppConfig() {
	const config = await readAppConfigFile()
	Object.assign(appConfig, config)
	initialized = true
}

export function getAppConfig(): AppConfig
export function getAppConfig<T extends AppConfigKey>(key?: T): AppConfig[T]
/**
 * Get an application config value
 *
 * @param key - The config key to get
 * @return - If key is provided, the value of the key. Otherwise, the full config
 */
export function getAppConfig<T extends AppConfigKey>(key?: T): AppConfig | AppConfig[T] {
	if (!initialized) {
		throw new Error('The application config is not initialized yet')
	}

	const config = { ...defaultAppConfig, ...appConfig }

	if (key) {
		return config[key]
	}

	return config
}

/**
 * Set an application config value
 *
 * @param key - Settings key to set
 * @param value - Value to set or undefined to reset to the default value
 */
export function setAppConfig<K extends AppConfigKey>(key: K, value?: AppConfig[K]) {
	// Ignore if no change
	if (appConfig[key] === value) {
		return
	}

	if (value !== undefined) {
		appConfig[key] = value
	} else {
		delete appConfig[key]
		value = defaultAppConfig[key]
	}

	for (const contents of webContents.getAllWebContents()) {
		contents.send('app:config:change', { key, value, appConfig })
	}

	for (const listener of appConfigChangeListeners[key] ?? []) {
		listener(value)
	}

	writeAppConfigFile(appConfig)
}

/**
 * Listen to application config changes
 *
 * @param key - The config key to listen to
 * @param callback - The callback to call when the config changes
 */
export function onAppConfigChange<K extends AppConfigKey>(key: K, callback: (value: AppConfig[K]) => void) {
	if (!appConfigChangeListeners[key]) {
		appConfigChangeListeners[key] = new Set([])
	}
	appConfigChangeListeners[key].add(callback)
}
