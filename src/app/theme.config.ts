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
