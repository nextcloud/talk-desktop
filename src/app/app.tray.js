/**
 * @copyright Copyright (c) 2023, Julian Petri <julian.petri@iconics.de>
 * @author Julian Petri <julian.petri@iconics.de>
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

/**
 * Setup tray icon
 *
 * @param clickCb
 */
function setupTrayIcon(clickCb) {
	const tray = new Tray(path.join(__dirname, '..', '..', 'img', 'icons', 'icon.png'))
	tray.setToolTip(app.name)
	tray.setContextMenu(Menu.buildFromTemplate([
		{
			label: 'Quit',
			click: () => app.quit(),
		},
	]))
	tray.on('click', () => {
		clickCb()
	})
}

module.exports = {
	setupTrayIcon,
}
