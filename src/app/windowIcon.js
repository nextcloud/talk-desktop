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

const path = require('node:path')
const {
	isLinux,
	isWindows,
	isMac,
} = require('../shared/os.utils.js')

let windowIcon

if (isWindows()) {
	windowIcon = path.join(__dirname, '../img/icons/icon.ico')
} else if (isMac()) {
	windowIcon = path.join(__dirname, '../img/icons/icon.icns')
} else if (isLinux()) {
	windowIcon = path.join(__dirname, '../img/icon.png')
} else {
	// Also use PNG as default
	windowIcon = path.join(__dirname, '../img/icon.png')
}

module.exports = {
	windowIcon,
}
