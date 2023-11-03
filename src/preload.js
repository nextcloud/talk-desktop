/*
 * @copyright Copyright (c) 2022 Grigorii Shartsev <me@shgk.me>
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

const {
	contextBridge,
	ipcRenderer,
} = require('electron')

const packageJson = require('../package.json')
const talkPackageJson = require('@talk/package.json')

const packageInfo = {
	productName: packageJson.productName,
	version: packageJson.version,
	talkVersion: talkPackageJson.version,
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
	 * Quit the application
	 */
	quit: () => ipcRenderer.send('app:quit'),
	/**
	 * Get OS version and versions as flags
	 *
	 * @return {Promise<import('./shared/os.utils.js').OsVersion>}
	 */
	getOs: () => ipcRenderer.invoke('app:getOs'),
	/**
	 * Get system locale and preferred language
	 *
	 * @return {Promise<{ locale: string, language: string }>}
	 */
	getSystemL10n: () => ipcRenderer.invoke('app:getSystemL10n'),
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
	 * Set or remove notifications badge
	 *
	 * @param {number} [count] - Count of notification or 0 to disable
	 * @return {Promise<void>}
	 */
	setBadgeCount: (count) => ipcRenderer.invoke('app:setBadgeCount', count),
	/**
	 * Relaunch the application
	 */
	relaunch: () => ipcRenderer.send('app:relaunch'),
	/**
	 * Send appData to main process on restore
	 *
	 * @param {object} appDataDto appData as plain object
	 */
	sendAppData: (appDataDto) => ipcRenderer.send('appData:receive', appDataDto),
	/**
	 * Open a web-view modal window with Nextcloud Server login page
	 *
	 * @param {string} server - Server URL
	 * @return {Promise<import('./accounts/login.service.js').Credentials|Error>}
	 */
	openLoginWebView: (server) => ipcRenderer.invoke('authentication:openLoginWebView', server),
	/**
	 * Open main window after logging in
	 *
	 * @return {Promise<void>}
	 */
	login: () => ipcRenderer.invoke('authentication:login'),
	/**
	 * Logout and open accounts window
	 *
	 * @return {Promise<void>}
	 */
	logout: () => ipcRenderer.invoke('authentication:logout'),
	/**
	 * Focus and restore the talk window
	 *
	 * @return {Promise<void>}
	 */
	focusTalk: () => ipcRenderer.invoke('talk:focus'),
	/**
	 * Show the help window (aka About)
	 *
	 * @return {Promise<void>}
	 */
	showHelp: () => ipcRenderer.invoke('help:show'),
	/**
	 * Show the upgrade window
	 *
	 * @return {Promise<void>}
	 */
	showUpgrade: () => ipcRenderer.invoke('upgrade:show'),
}

// Set global window.TALK_DESKTOP
contextBridge.exposeInMainWorld('TALK_DESKTOP', TALK_DESKTOP)
