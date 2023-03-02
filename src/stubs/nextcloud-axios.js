/*
 * @copyright Copyright (c) 2022 Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
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

import axios from '../../node_modules/@nextcloud/axios/dist/index.esm.js'
import { appData } from '../app/AppData.js'

axios.interceptors.request.use((config) => {
	config.withCredentials = true
	delete config.headers.requesttoken
	config.headers['OCS-APIRequest'] = 'true'
	if (appData.credentials) {
		config.auth = {
			username: appData.credentials.user,
			password: appData.credentials.password,
		}
	}
	return config
}, (error) => Promise.reject(error))

axios.interceptors.response.use((response) => response, (error) => {
	if (error?.response?.status === 401) {
		window.TALK_DESKTOP.logout()
	}
	return Promise.reject(error)
})

export default axios
