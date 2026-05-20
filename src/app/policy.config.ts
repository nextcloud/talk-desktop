/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { systemPreferences } from 'electron'
import { execFileSync } from 'node:child_process'
import { isMac, isWindows } from './system.utils.ts'

export type PolicyConfig = {
	serverUrl?: string
}

/**
 * Read a single Windows policy registry value.
 *
 * @param key - Registry key
 * @param name - Value name
 */
function getWindowsPolicyValue(key: string, name: string): string | undefined {
	try {
		const stdout = execFileSync('reg', ['query', key, '/v', name], { encoding: 'utf8', windowsHide: true })
		return stdout.match(new RegExp(`\\s${name}\\s+REG_\\w+\\s+(.+)`, 'i'))?.[1]?.trim()
	} catch {
		return undefined
	}
}

/**
 * Get deployment configuration from Windows policy.
 */
function getWindowsPolicyConfig(): PolicyConfig {
	for (const key of ['HKLM\\Software\\Policies\\Nextcloud\\Talk', 'HKCU\\Software\\Policies\\Nextcloud\\Talk']) {
		const serverUrl = getWindowsPolicyValue(key, 'ServerUrl')
		if (serverUrl) {
			return { serverUrl }
		}
	}

	return {}
}

/**
 * Get deployment configuration from macOS managed preferences.
 */
function getMacPolicyConfig(): PolicyConfig {
	const serverUrl = systemPreferences.getUserDefault('ServerUrl', 'string')
	return serverUrl ? { serverUrl } : {}
}

/**
 * Get deployment configuration from OS policy.
 */
export function getPolicyConfig(): PolicyConfig {
	if (isWindows) {
		return getWindowsPolicyConfig()
	}

	if (isMac) {
		return getMacPolicyConfig()
	}

	return {}
}
