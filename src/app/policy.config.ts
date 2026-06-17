/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { systemPreferences } from 'electron'
import { execFileSync } from 'node:child_process'
import { isMac, isWindows } from './system.utils.ts'

export type PolicyConfig = {
	serverUrl?: string
	enforceServerUrl?: boolean
}

/**
 * Read a single Windows policy registry value.
 *
 * @param key - Registry key
 * @param name - Value name
 */
function getRegistryValue(key: string, name: string): string | undefined {
	try {
		const stdout = execFileSync('reg', ['query', key, '/v', name], { encoding: 'utf8', windowsHide: true })
		return stdout.match(new RegExp(`\\s${name}\\s+REG_\\w+\\s+(.+)`, 'i'))?.[1]?.trim()
	} catch {
		return undefined
	}
}

/**
 * Get deployment configuration from OS policy.
 */
export function getPolicyConfig(): PolicyConfig {
	if (isWindows) {
		for (const key of ['HKLM\\Software\\Policies\\Nextcloud\\Talk', 'HKCU\\Software\\Policies\\Nextcloud\\Talk']) {
			const serverUrl = getRegistryValue(key, 'ServerUrl')
			if (serverUrl) {
				const enforceServerUrl = getRegistryValue(key, 'EnforceServerUrl')
				return {
					serverUrl,
					enforceServerUrl: enforceServerUrl === '1' || enforceServerUrl === '0x1' || enforceServerUrl?.toLowerCase() === 'true',
				}
			}
		}
	}

	if (isMac) {
		const serverUrl = systemPreferences.getUserDefault('ServerUrl', 'string')
		if (serverUrl) {
			return {
				serverUrl,
				enforceServerUrl: systemPreferences.getUserDefault('EnforceServerUrl', 'boolean'),
			}
		}
	}

	return {}
}
