/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { normalizeServerUrl, parseAccountId } from '../shared/accounts.utils.ts'
import { BUILD_CONFIG } from '../shared/build.config.ts'
import { isWindows } from './system.utils.ts'
import { getWindowsRegistryItem } from './windows.utils.ts'

type ManagedConfigKey = 'accounts' | 'serverUrl'

/**
 * Read managed application configuration:
 * - Windows Registry Policies
 * - macOS Managed Preferences (not implemented)
 */
export function readManagedConfig() {
	const accounts = readManagedConfigValue('accounts')?.split(',')
		// Parse to get normalized accountId
		.map((account) => parseAccountId(account))
		// Filter out invalid/empty value
		.filter(Boolean)
		// Keep only the accountId string
		.map((account) => account.accountId) ?? []

	// Fallback to simple serverUrl setting if accounts is not set
	if (!accounts.length) {
		const serverUrl = normalizeServerUrl(readManagedConfigValue('serverUrl'))
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
 * - macOS Managed Preferences (not implemented)
 *
 * @param key - Configuration key
 */
function readManagedConfigValue(key: ManagedConfigKey): string | undefined {
	if (isWindows) {
		return readWindowsManagedConfigValue(key)
	}
	// TODO: add macOS support
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
 */
function readWindowsManagedConfigValue(key: ManagedConfigKey): string | undefined {
	return getWindowsRegistryItem('HKEY_CURRENT_USER', `Software\\Policies\\${BUILD_CONFIG.companyName}\\${BUILD_CONFIG.applicationName}`, key)
		?? getWindowsRegistryItem('HKEY_LOCAL_MACHINE', `Software\\Policies\\${BUILD_CONFIG.companyName}\\${BUILD_CONFIG.applicationName}`, key)
}
