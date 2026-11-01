/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { UserDefaultTypes } from 'electron'

import { systemPreferences } from 'electron'
import { normalizeServerUrl, parseAccountId } from '../shared/accounts.utils.ts'
import { BUILD_CONFIG } from '../shared/build.config.ts'
import { isMac, isWindows } from './system.utils.ts'
import { getWindowsRegistryItem } from './windows.utils.ts'

type ManagedConfigKey = 'accounts' | 'serverUrl'

type ManagedConfigValueTypes = Pick<UserDefaultTypes, 'string' | 'boolean'>
type ManagedConfigValueType = keyof ManagedConfigValueTypes

/**
 * Read managed application configuration:
 * - Windows Registry Policies
 * - macOS Managed Preferences
 */
export function readManagedConfig() {
	const accounts = readManagedConfigValue('accounts', 'string')?.split(',')
		// Parse to get normalized accountId
		.map((account) => parseAccountId(account))
		// Filter out invalid/empty value
		.filter(Boolean)
		// Keep only the accountId string
		.map((account) => account.accountId) ?? []

	// Fallback to simple serverUrl setting if accounts is not set
	if (!accounts.length) {
		const serverUrl = normalizeServerUrl(readManagedConfigValue('serverUrl', 'string'))
		if (serverUrl) {
			accounts.push(serverUrl)
		}
	}

	return {
		accounts,
	}
}

/**
 * Read environment managed configuration for the application:
 * - Windows Registry Policies
 * - macOS Managed Preferences
 * Note: on macOS a missing boolean value is read as false, not undefined.
 *
 * @param key - Configuration key
 * @param type - Value type
 */
function readManagedConfigValue(key: ManagedConfigKey, type: 'string'): string | undefined
function readManagedConfigValue(key: ManagedConfigKey, type: 'boolean'): boolean | undefined
function readManagedConfigValue(key: ManagedConfigKey, type: ManagedConfigValueType): string | boolean | undefined {
	if (isWindows) {
		return readWindowsManagedConfigValue(key, type)
	}

	if (isMac) {
		return readMacOsManagedConfigValue(key, type)
	}

	// TODO: add Linux support?
	return undefined
}

/**
 * Read managed configuration (policy) from Windows Registry in the following order:
 * 1. HKEY_CURRENT_USER\Software\Policies\{vendor}\{applicationName}\{key}
 * 2. HKEY_LOCAL_MACHINE\Software\Policies\{vendor}\{applicationName}\{key}
 *
 * @see https://learn.microsoft.com/en-us/previous-versions/windows/desktop/policy/implementing-registry-based-policy
 * @see https://learn.microsoft.com/en-us/windows/client-management/understanding-admx-backed-policies
 * @param key - Configuration key
 * @param type - Value type
 */
function readWindowsManagedConfigValue(key: ManagedConfigKey, type: ManagedConfigValueType): string | boolean | undefined {
	const POLICIES_PATH = `Software\\Policies\\${BUILD_CONFIG.companyName}\\${BUILD_CONFIG.applicationName}`

	const registryType = type === 'boolean' ? 'dword' : 'string'
	const value = getWindowsRegistryItem('HKEY_CURRENT_USER', POLICIES_PATH, key, registryType)
		?? getWindowsRegistryItem('HKEY_LOCAL_MACHINE', POLICIES_PATH, key, registryType)

	if (typeof value === 'number') {
		return value !== 0
	}

	return value
}

/**
 * Read managed configuration from macOS Managed Preferences.
 * Electron's `systemPreferences.getUserDefault` reads NSUserDefaults,
 * which merges configs from user configuration and /Library/Managed Preferences/,
 * used by administrators to manage application configuration.
 *
 * @see https://developer.apple.com/documentation/foundation/userdefaults
 * @param key - Configuration key
 * @param type - Value type
 */
function readMacOsManagedConfigValue<T extends ManagedConfigValueType>(key: ManagedConfigKey, type: T): ManagedConfigValueTypes[T] | undefined {
	try {
		return systemPreferences.getUserDefault(key, type)
	} catch {
		return undefined
	}
}
