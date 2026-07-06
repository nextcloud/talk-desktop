/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { createRequire } from 'node:module'

export type HKEY = 'HKEY_CURRENT_USER' | 'HKEY_LOCAL_MACHINE' | 'HKEY_CLASSES_ROOT' | 'HKEY_USERS' | 'HKEY_CURRENT_CONFIG'

/**
 * Read Windows Registry item (only string values are supported)
 *
 * @param hive - Registry hive (e.g., HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE)
 * @param path - Registry path (e.g., Software\Policies\Nextcloud\Talk)
 * @param name - Registry value name (e.g., accounts)
 */
export function getWindowsRegistryItem(hive: HKEY, path: string, name: string): string | undefined {
	if (process.platform !== 'win32') {
		throw new Error('getWindowsRegistryItem is only available on Windows')
	}

	if (process.arch !== 'x64') {
		throw new Error('getWindowsRegistryItem is only available on x64')
	}

	try {
		const require = createRequire(import.meta.url)
		const windowRegistry = require('@vscode/windows-registry/prebuilds/win32-x64/@vscode+windows-registry.node')

		return windowRegistry.GetStringRegKey(hive, path, name)
	} catch (error) {
		// 'Unable to open registry key' is expected when the registry key does not exist
		if ((error as Error).message !== 'Unable to open registry key') {
			console.error('Error getting Windows Registry item:', (error as Error).message)
		}
		return undefined
	}
}
