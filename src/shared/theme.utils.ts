/*!
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

type NextcloudTheme = 'light' | 'dark' | 'light-highcontrast' | 'dark-highcontrast' | 'opendyslexic'

/**
 * Set application theming
 *
 * @param options - Theming options
 * @param options.colorScheme - Color scheme (dark mode)
 * @param options.highContrast - Whether to follow the system settings, enable (enforce) or disable (suppress) high contrast theme
 * @param options.defaultColorScheme - System default color scheme to avoid matchMedia call, used to choose concrete high contrast theme
 * @param options.openDyslexic - Whether to enable a dyslexic font (OpenDyslexic) for better readability
 */
export function setTheming({
	colorScheme = 'default',
	highContrast = 'default',
	openDyslexic = false,
	defaultColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
}: {
	colorScheme: 'default' | 'light' | 'dark'
	highContrast: 'default' | 'enabled' | 'disabled'
	openDyslexic: boolean
	defaultColorScheme?: 'light' | 'dark'
}) {
	const themes: Set<NextcloudTheme> = new Set()

	if (colorScheme !== 'default') {
		themes.add(colorScheme)
	}

	if (highContrast !== 'default') {
		const currentColorScheme = colorScheme === 'default' ? defaultColorScheme : colorScheme

		if (highContrast === 'enabled') {
			// Unlike the color scheme theme, high contrast themes require explicit light/dark setting
			themes.add(`${currentColorScheme}-highcontrast`)
		} else if (highContrast === 'disabled' && colorScheme === 'default') {
			// To suppress the system high contrast theme, base theme must be enabled to override the default
			// This will override the default themes that follows the system setting
			themes.add(currentColorScheme)
		}
	}

	if (openDyslexic) {
		themes.add('opendyslexic')
	}

	applyThemes([...themes])
}

/**
 * Apply Nextcloud themes on the page
 *
 * @param themes - Themes list
 */
function applyThemes(themes: NextcloudTheme[]) {
	const currentThemeAttrs = document.body.getAttributeNames().filter((attr) => attr.startsWith('data-theme-'))
	const newThemeAttrs = themes.map((theme) => `data-theme-${theme}`)

	for (const attr of currentThemeAttrs) {
		if (!newThemeAttrs.includes(attr)) {
			document.body.removeAttribute(attr)
		}
	}

	for (const attr of newThemeAttrs) {
		document.body.setAttribute(attr, '')
	}

	document.body.setAttribute('data-themes', themes.join(' '))
}
