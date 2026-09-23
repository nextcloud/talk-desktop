/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { BrowserWindow, ipcMain, nativeTheme } from 'electron'
import { getAppConfig, onAppConfigChange } from './AppConfig.ts'

onAppConfigChange('theme', applyTheme)

/**
 * Apply the application theme based on the AppConfig
 */
export function applyTheme() {
	const theme = getAppConfig('theme')

	const configToNativeTheme = {
		default: 'system',
		dark: 'dark',
		light: 'light',
	} as const

	nativeTheme.themeSource = configToNativeTheme[theme]
}

// Unlike `prefers-color-scheme`, Electron does not set `prefers-contrast` according to nativeTheme.shouldUseHighContrastColors
// Providing it via IPC to enable high contrast theme manually ...

nativeTheme.on('updated', () => {
	for (const browserWindow of BrowserWindow.getAllWindows()) {
		browserWindow.webContents.send('app:prefersContrastMore:change', nativeTheme.shouldUseHighContrastColors)
	}
})

ipcMain.on('app:prefersContrastMore:get', (event) => {
	event.returnValue = nativeTheme.shouldUseHighContrastColors
})

/**
 * Get original system theme.
 * Once theme is overridden in Electron, it only returns the overridden values.
 * The only way to get the system theme is to switch to the system and then back.
 * This API is sync and should not trigger any flickering...
 */
export function getSystemTheme() {
	const themeSource = nativeTheme.themeSource

	nativeTheme.themeSource = 'system'
	const isDark = nativeTheme.shouldUseDarkColors
	nativeTheme.themeSource = themeSource

	return isDark ? 'dark' : 'light'
}

ipcMain.on('app:systemTheme:get', (event) => {
	event.returnValue = getSystemTheme()
})
