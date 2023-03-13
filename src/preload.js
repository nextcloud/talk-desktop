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
const {
	contextBridge,
	ipcRenderer,
} = require('electron')

const packageJson = require('../package.json')
const packageInfo = {
	productName: packageJson.productName,
	version: packageJson.version,
	description: packageJson.description,
	bugs: packageJson.bugs,
	license: packageJson.license,
	author: packageJson.author,
	repository: packageJson.repository.url,
}

/**
 * @global
 */
const TALK_DESKTOP = {
	/**
	 * Subset of package.json meta-data
	 *
	 * @type {typeof packageInfo} packageInfo
	 */
	packageInfo,
	/**
	 * Get OS version and versions as flags
	 *
	 * @return {Promise<import('./shared/os.utils.js').OsVersion>}
	 */
	getOs: () => ipcRenderer.invoke('app:getOs'),
	/**
	 * Enable web request intercepting
	 *
	 * @type {typeof import('./app/webRequestInterceptor').enableWebRequestInterceptor}
	 */
	enableWebRequestInterceptor: (...args) => ipcRenderer.invoke('app:enableWebRequestInterceptor', ...args),
	/**
	 * Disable web request intercepting
	 *
	 * @type {typeof import('./app/webRequestInterceptor').disableWebRequestInterceptor}
	 */
	disableWebRequestInterceptor: (...args) => ipcRenderer.invoke('app:disableWebRequestInterceptor', ...args),
	/**
	 * Open a web-view modal window with Nextcloud Server login page
	 *
	 * @param {string} server - Server URL
	 * @return {Promise<import('./accounts/login.service.js').Credentials|Error>}
	 */
	openLoginWebView: (server) => ipcRenderer.invoke('accounts:openLoginWebView', server),
	/**
	 * Open main window after logging in
	 *
	 * @return {Promise<void>}
	 */
	login: () => ipcRenderer.invoke('accounts:login'),
	/**
	 * Logout and open accounts window
	 *
	 * @return {Promise<void>}
	 */
	logout: () => ipcRenderer.invoke('accounts:logout'),
}

// Set global window.TALK_DESKTOP
contextBridge.exposeInMainWorld('TALK_DESKTOP', TALK_DESKTOP)
