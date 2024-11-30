/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { execSync } from 'node:child_process'
import { isWindows } from './system.utils.ts'

/**
 * Read a value from the Windows registry (only number values are supported)
 * @param key - The registry key to read from
 * @param value - The value to read
 */
function readRegistryValue(key: string, value: string) {
	if (!isWindows) {
		throw new Error('Trying to read Windows registry on a non-Windows system')
	}

	// https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/reg-query
	const result = execSync(`reg query ${key} /v ${value}`, { encoding: 'utf-8' })

	// Example: "    SystemUsesLightTheme    REG_DWORD    0x0"
	const match = result.match(new RegExp(`\\s+${value}\\s+REG_[A-Z]+\\s+(0x[0-9a-fA-F]+)`))

	if (!match) {
		return undefined
	}

	return parseInt(match[1], 16)
}

/**
 *
 */
function getPreferredThemeWindows() {
	// Apps (windows)
	const AppsUseLightTheme = readRegistryValue('HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize', 'AppsUseLightTheme') ?? 1
	// Taskbar/SystemTray
	const SystemUsesLightTheme = readRegistryValue('HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize', 'SystemUsesLightTheme ') ?? 0

	const appsTheme = AppsUseLightTheme === 1 ? 'light' : 'dark'
	const systemTheme = SystemUsesLightTheme === 1 ? 'light' : 'dark'

	return {
		appsTheme,
		systemTheme,
	}
}

/**
 *
 */
export function getPreferredTheme() {
	if (isWindows) {
		return getPreferredThemeWindows()
	}
}
