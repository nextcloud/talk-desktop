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
import '../../shared/assets/default/css/default.css'
import '../../shared/assets/default/css/server.css'

import Vue from 'vue'
import HelpApp from './HelpApp.vue'
import { appData } from '../../app/AppData.js'

appData.restore()

window.TALK_DESKTOP.getOs().then(os => {
	window.OS = os
	new Vue(HelpApp).$mount('#app')
})
