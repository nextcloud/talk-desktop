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

import '../shared/assets/default/css/icons.css'

import { appData } from '../app/AppData.js'
import { refetchAppDataIfDirty } from '../app/appData.service.js'

const quitButton = document.querySelector('.quit')
quitButton.addEventListener('click', () => window.TALK_DESKTOP.quit())

window.TALK_DESKTOP.getOs().then(os => {
	quitButton.classList.remove('hidden')
	if (os.isMac) {
		quitButton.classList.add('quit_mac')
	}
})

appData.restore()

if (appData.credentials) {
	await window.TALK_DESKTOP.enableWebRequestInterceptor(appData.serverUrl, { enableCors: true, enableCookies: true, credentials: appData.credentials })
	await refetchAppDataIfDirty(appData)
}

window.TALK_DESKTOP.sendAppData(appData.toJSON())
