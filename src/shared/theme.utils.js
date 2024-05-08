/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * @return {boolean}
 */
export function prefersDark() {
	return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * @param {'light'|'dark'} [theme] - Light or Dark theme. If not set then system theme is used
 */
export function applyBodyThemeAttrs(theme) {
	if (!theme) {
		theme = prefersDark() ? 'dark' : 'light'
	}
	delete document.body.dataset.themeLight
	delete document.body.dataset.themeDark
	document.body.dataset[`theme${theme[0].toUpperCase() + theme.substring(1)}`] = ''
	document.body.dataset.themes = theme
}
