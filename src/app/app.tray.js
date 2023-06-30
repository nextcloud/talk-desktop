/**
 * @copyright Copyright (c) 2023, Julian Petri <julian.petri@iconics.de>
 * @author Julian Petri <julian.petri@iconics.de>
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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

const {
	app,
	Tray,
	Menu,
} = require('electron')
const path = require('path')
const { isMac, isWindows } = require('../shared/os.utils.js')

/**
 * Setup tray with an icon that provides a context menu.
 *
 * @param {object} options Object with one property 'click' which is a function that will be called when a user clicks the tray icon or the 'Open' tray menu item.
 */
function setupTray(options) {
	const tray = new Tray(path.join(
		__dirname, '..', '..', 'img', 'icons',
		isMac() ? 'TrayIconTemplate.png' : isWindows() ? 'icon.ico' : 'icon.png',
	))
	tray.setToolTip(app.name)
	tray.setContextMenu(Menu.buildFromTemplate([
		{
			label: 'Open',
			click: () => options.click(),
		},
		{
			role: 'quit',
		},
	]))
	tray.on('click', () => {
		options.click()
	})
}

module.exports = {
	setupTray,
}
