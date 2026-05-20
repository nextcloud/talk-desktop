/*!
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Set Nextcloud Theming
 *
 * @param options - Theming options
 * @param options.colorScheme - Color scheme (dark mode)
 * @param options.highContrast - Whether to follow the system settings, enable (enforce) or disable (suppress) high contrast theme
 * @param options.openDyslexic - Whether to enable the dyslexic font (OpenDyslexic) for better readability
 */
export function setTheming({
	colorScheme = 'default',
	highContrast = 'default',
	openDyslexic = false,
}: {
	colorScheme: 'default' | 'light' | 'dark'
	highContrast: 'default' | 'enabled' | 'disabled'
	openDyslexic: boolean
}) {
	const themes: string[] = []

	if (colorScheme !== 'default') {
		themes.push(colorScheme)
	}

	if (highContrast !== 'default') {
		const currentColorScheme = colorScheme === 'default'
			? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
			: colorScheme
		if (highContrast === 'enabled') {
			// Unlike the color scheme theme, high contrast themes require explicit light/dark setting
			themes.push(`${currentColorScheme}-highcontrast`)
		} else if (highContrast === 'disabled' && colorScheme === 'default') {
			// To suppress the system high contrast theme, base theme must be enabled to override the default
			// This will override the default themes that follows the system setting
			themes.push(currentColorScheme)
		}
	}

	if (openDyslexic) {
		themes.push('opendyslexic')
	}

	applyThemingAttributes(themes)
}

/**
 * Apply Nextcloud Theming data attributes on the body element
 *
 * @param themes {('light' | 'dark' | 'light-highcontrast' | 'dark-highcontrast' | 'opendyslexic')[]} - Themes
 */
function applyThemingAttributes(themes: string[]) {
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
