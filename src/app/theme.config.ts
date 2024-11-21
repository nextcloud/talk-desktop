/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { nativeTheme } from 'electron'
import { getAppConfig, onAppConfigChange } from './AppConfig.ts'

onAppConfigChange('theme', applyTheme)

/**
 * Apply the application theme based on the AppConfig
 */
export function applyTheme() {
	const theme = getAppConfig('theme')

	// TODO: add high-contrast themes
	const configToNativeTheme = {
		default: 'system',
		dark: 'dark',
		light: 'light',
	} as const

	nativeTheme.themeSource = configToNativeTheme[theme]
}
