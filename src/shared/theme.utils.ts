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
 * Apply theme data attributes
 *
 * @param theme - Base theme
 * @param highcontrast - Whether to apply high-contrast theme
 * @param opendyslexic - Whether to apply OpenDyslexic theme
 * @param isPreferredDark - Current system preference for dark theme necessary for high-contrast theme
 */
export function applyBodyThemeAttrs({
	theme,
	highcontrast,
	opendyslexic,
	isPreferredDark = prefersDark(),
}: {
	theme: 'default' | 'dark' | 'light',
	highcontrast: boolean,
	opendyslexic: boolean,
	isPreferredDark?: boolean,
}) {
	const themes = []

	document.body.removeAttribute('data-theme-light')
	document.body.removeAttribute('data-theme-dark')
	document.body.removeAttribute('data-theme-light-highcontrast')
	document.body.removeAttribute('data-theme-dark-highcontrast')
	document.body.removeAttribute('data-theme-opendyslexic')

	document.body.setAttribute(`data-theme-${theme}`, '')
	themes.push(theme)

	if (highcontrast) {
		const lightOrDark = theme === 'default' ? (isPreferredDark ? 'dark' : 'light') : theme
		document.body.setAttribute(`data-theme-${lightOrDark}-highcontrast`, '')
		themes.push(`${lightOrDark}-highcontrast`)
	}

	if (opendyslexic) {
		document.body.setAttribute('data-theme-opendyslexic', '')
		themes.push('opendyslexic')
	}

	document.body.setAttribute('data-themes', themes.join(' '))
}
