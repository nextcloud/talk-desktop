/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { join } from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import { app } from 'electron'
import { isLinux, isMac } from '../shared/os.utils.js'

const APP_CONFIG_FILE_NAME = 'config.json'

// Windows: C:\Users\<username>\AppData\Roaming\Nextcloud Talk\config.json
// Linux: ~/.config/Nextcloud Talk/config.json (or $XDG_CONFIG_HOME)
// macOS: ~/Library/Application Support/Nextcloud Talk/config.json
const APP_CONFIG_FILE_PATH = join(app.getPath('userData'), APP_CONFIG_FILE_NAME)

/**
 * Application level config. Applied to all accounts and persist on re-login.
 * Stored in the application data directory.
 */
export type AppConfig = {
	// ----------------
	// General settings
	// ----------------

	/** Whether the app should run on startup. Not implemented */
	runOnStartup: boolean

	// -------------------
	// Appearance settings
	// -------------------

	/** Whether to use a monochrome tray icon. By default, true only on Mac. Not implemented */
	monochromeTrayIcon: boolean
	/** The scale factor for the app. By default, 1. Not implemented */
	scale: number
	/** List of languages to use for spell checking in addition to the system language. By default, none. Not implemented */
	spellCheckLanguages: string[]

	// ----------------
	// Privacy settings
	// ----------------

	/** Whether to show message previews in notifications. By default, true. Not implemented */
	showMessagePreviewInNotifications: boolean

	// ----------------------
	// Notifications settings
	// ----------------------
	/**
	 * Whether to play a sound when a notification is received
	 * - always: always play sound
	 * - respect-dnd: play sound only if user status isn't Do-Not-Disturb [default]
	 * - never: disable notification sound
	 * Not implemented
	 */
	playSound: 'always' | 'respect-dnd' | 'never'
}

/**
 * Get the default config
 */
const defaultAppConfig: AppConfig = {
	runOnStartup: false,
	theme: 'default',
	systemTitleBar: isLinux(),
	monochromeTrayIcon: isMac(),
	scale: 1,
	spellCheckLanguages: [],
	showMessagePreviewInNotifications: true,
	playSound: 'respect-dnd',
}

/** Local cache of the config file mixed with the default values */
const appConfig: Partial<AppConfig> = {}
/** Whether the application config has been read from the config file and ready to use */
let initialized = false

/**
 * Read the application config from the file
 */
async function readAppConfigFile(): Promise<Partial<AppConfig>> {
	try {
		const content = await readFile(APP_CONFIG_FILE_PATH, 'utf-8')
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
 * @param config - The config to write
 */
async function writeAppConfigFile(config: Partial<AppConfig>) {
	try {
		// Format for readability
		const content = JSON.stringify(config, null, 2)
		await writeFile(APP_CONFIG_FILE_PATH, content)
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
export function getAppConfig<T extends keyof AppConfig>(key?: T): AppConfig[T]
/**
 * Get an application config value
 * @param key - The config key to get
 * @return - If key is provided, the value of the key. Otherwise, the full config
 */
export function getAppConfig<T extends keyof AppConfig>(key?: T): AppConfig | AppConfig[T] {
	if (!initialized) {
		throw new Error('The application config is not initialized yet')
	}

	const config = Object.assign({}, defaultAppConfig, appConfig)

	if (key) {
		return config[key]
	}

	return config
}

/**
 * Set an application config value
 * @param key - Settings key to set
 * @param value - Value to set or undefined to reset to the default value
 * @return Promise<AppConfig> - The full settings after the change
 */
export async function setAppConfig<K extends keyof AppConfig>(key: K, value?: AppConfig[K]) {
	if (value !== undefined) {
		appConfig[key] = value
	} else {
		delete appConfig[key]
	}
	await writeAppConfigFile(appConfig)
}
