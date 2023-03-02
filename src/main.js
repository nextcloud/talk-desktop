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
	app,
	BrowserWindow,
	ipcMain,
} = require('electron')
const {
	default: installExtension,
	VUEJS3_DEVTOOLS,
} = require('electron-devtools-installer')
const { createTalkWindow } = require('./talk/talk.window')
const { createAccountsWindow } = require('./accounts/accounts.window')
const { openLoginWebView } = require('./accounts/login.window')
const { createWelcomeWindow } = require('./welcome/welcome.window.js')
const { setTimeout } = require('timers/promises')
const {
	enableWebRequestInterceptor,
	disableWebRequestInterceptor,
} = require('./app/webRequestInterceptor.js')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
//   app.quit();
// }

ipcMain.handle('app:enableWebRequestInterceptor', (event, ...args) => enableWebRequestInterceptor(...args))
ipcMain.handle('app:disableWebRequestInterceptor', (event, ...args) => disableWebRequestInterceptor(...args))

app.whenReady().then(async () => {
	if (process.env.NODE_ENV !== 'production') {
		await installExtension(VUEJS3_DEVTOOLS)
	}

	// TODO: add windows manager
	/**
	 * @type {import('electron').BrowserWindow}
	 */
	let mainWindow
	let createMainWindow

	console.log('Start Welcome Window')

	const welcomeWindow = createWelcomeWindow()
	await new Promise((resolve) => {
		welcomeWindow.once('ready-to-show', () => {
			welcomeWindow.show()
			resolve()
		})
	})

	// Timeout to emulate startup loading
	// TODO: replace with real initialization
	if (process.env.NODE_ENV === 'production') {
		await setTimeout(7000)
	}

	// TODO: handle JSON parsing error
	const maybeAppData = await welcomeWindow.webContents.executeJavaScript(`JSON.parse(localStorage['AppData'] ?? null)`)
	if (maybeAppData) {
		enableWebRequestInterceptor(maybeAppData.serverUrl, {
			enableCors: true,
			enableCookies: true,
			credentials: maybeAppData.credentials,
		})
		mainWindow = createTalkWindow()
		createMainWindow = createTalkWindow
	} else {
		await welcomeWindow.webContents.session.clearStorageData()
		mainWindow = createAccountsWindow()
		createMainWindow = createAccountsWindow
	}

	mainWindow.once('ready-to-show', () => {
		mainWindow.show()
		welcomeWindow.close()
	})

	ipcMain.handle('accounts:openLoginWebView', async (event, serverUrl) => openLoginWebView(mainWindow, serverUrl))

	ipcMain.handle('accounts:login', async () => {
		mainWindow.close()
		mainWindow = createTalkWindow()
		createMainWindow = createTalkWindow
	})

	ipcMain.handle('accounts:logout', async (event) => {
		if (createMainWindow === createTalkWindow) {
			await mainWindow.webContents.session.clearStorageData()
			mainWindow.close()
			mainWindow = createAccountsWindow()
			createMainWindow = createAccountsWindow
			mainWindow.once('ready-to-show', () => {
				mainWindow.show()
			})
		}
	})

	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	app.on('activate', function() {
		if (BrowserWindow.getAllWindows().length === 0) {
			mainWindow = createMainWindow()
		}
	})
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})
