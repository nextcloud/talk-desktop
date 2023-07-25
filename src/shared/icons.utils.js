/*
 * @copyright Copyright (c) 2023 Grigorii Shartsev <me@shgk.me>
 *
 * @author Grigorii Shartsev <me@shgk.me>
 *
 * @license AGPL-3.0-or-later
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

const icons = {
	tray: {
		darwin: require('../../img/icons/icon-tray-mac.png'),

		// This property is not used, but import is required to add the icon to the bundle.
		// It will be used by electron internally
		darwin_x2: require('../../img/icons/icon-tray-mac@2x.png'),

		win32: require('../../img/icons/icon.ico'),

		linux: require('../../img/icons/icon-tray-linux.png'),
	},
}

/**
 * Get tray icon for the given platform
 *
 * @param {'darwin'|'win32'|'cygwin'|string} [platform] platform otherwise current process.platform is used
 */
function getTrayIcon(platform) {
	switch (platform ?? process.platform) {
	case 'darwin':
		return icons.tray.darwin
	case 'win32':
		return icons.tray.win32
	default:
		return icons.tray.linux
	}
}

module.exports = {
	getTrayIcon,
}
