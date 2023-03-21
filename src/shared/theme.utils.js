/*
 * @copyright Copyright (c) 2023 Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
 *
 * @author Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
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
