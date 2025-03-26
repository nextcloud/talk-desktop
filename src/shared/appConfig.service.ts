/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { AppConfig, AppConfigKey } from '../app/AppConfig.ts'

let appConfig: AppConfig | null = null

/**
 * Initialize the AppConfig
 */
export async function initAppConfig() {
	if (appConfig) {
		return
	}

	appConfig = await window.TALK_DESKTOP.getAppConfig()
}

/**
 * Get AppConfig
 *
 * @return - AppConfig
 */
export function getAppConfig() {
	if (!appConfig) {
		throw new Error('AppConfig is not initialized')
	}

	return appConfig
}

/**
 * Get an application config value
 *
 * @param key - The key of the config value
 * @return - The config value
 */
export function getAppConfigValue<K extends AppConfigKey>(key: K) {
	if (!appConfig) {
		throw new Error('AppConfig is not initialized')
	}

	return appConfig[key]
}
