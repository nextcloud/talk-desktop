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
	session,
} = require('electron')
const {
	default: installExtension,
	VUEJS3_DEVTOOLS,
} = require('electron-devtools-installer')
const { DEVSERVER_HOST } = require('./constants')
const { createTalkWindow } = require('./talk/talk.window')
const { createAccountsWindow } = require('./accounts/accounts.window')
const { createLoginWindow } = require('./accounts/login.window')
const {
	getCredentials,
	setCredentials,
} = require('./accounts/credentials.service')
const { createWelcomeWindow } = require('./welcome/welcome.window.js')
const { setTimeout } = require('timers/promises')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
//   app.quit();
// }

/**
 * @param {import('electron').BrowserWindow} parentWindow
 * @param {string} serverUrl
 * @return {Promise<Credentials>}
 */
async function authenticateWithLoginFlow(parentWindow, serverUrl) {
	return new Promise((resolve, reject) => {
		createLoginWindow({
			parentWindow,
			serverUrl,
			onSuccess: resolve,
			onFail: reject,
		})
	})
}

/**
 * Patch requests to solve CORS and sequire cookies problems
 * TODO: ONLY FOR PROTOTYPING. NOT SECURE.
 *
 * @param serverUrl
 */
function fixmeSetupRequestPatching(serverUrl) {
	const filter = {
		urls: [`${serverUrl}/*`],
	}

	session.defaultSession.webRequest.onBeforeSendHeaders(
		filter,
		(details, callback) => {
			details.requestHeaders.Origin = '*'
			callback({ requestHeaders: details.requestHeaders })
		},
	)

	session.defaultSession.webRequest.onHeadersReceived(
		filter,
		(details, callback) => {
			// For Talk Session Cookies as well as Files integration
			if (Array.isArray(details.responseHeaders['set-cookie'])) {
				details.responseHeaders['set-cookie'] = details.responseHeaders['set-cookie'].map(cookie => cookie.replace(/SameSite=(lax|strict)/i, 'SameSite=None'))
			}
			// For CORS
			details.responseHeaders['Access-Control-Allow-Origin'] = [DEVSERVER_HOST]
			details.responseHeaders['Access-Control-Allow-Credentials'] = ['true']
			callback({ responseHeaders: details.responseHeaders })
		},
	)
}

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
	const maybeCredentials = await welcomeWindow.webContents.executeJavaScript(`localStorage['credentials'] ?? ''`)
	if (maybeCredentials) {
		console.log('Credentials available')
		setCredentials(JSON.parse(maybeCredentials))
		fixmeSetupRequestPatching(getCredentials().server)
		// TODO: Load Capabilities and UserMetadata here
		mainWindow = createTalkWindow()
		createMainWindow = createTalkWindow
	} else {
		// TODO: hotfix to remove credentials and cookies from invalid or old session
		await welcomeWindow.webContents.session.clearStorageData()
		mainWindow = createAccountsWindow()
		createMainWindow = createAccountsWindow
	}

	mainWindow.once('ready-to-show', () => {
		mainWindow.show()
		welcomeWindow.close()
	})

	ipcMain.handle('accounts:open-login-view', async (event, serverUrl) => {
		const credentials = await authenticateWithLoginFlow(mainWindow, serverUrl)
		setCredentials(credentials)
		fixmeSetupRequestPatching(getCredentials().server)
		//mainWindow.close()
		mainWindow = createTalkWindow()
		createMainWindow = createTalkWindow
		return credentials
	})

	ipcMain.handle('accounts:logout', async (event) => {
		await mainWindow.webContents.session.clearStorageData()
		mainWindow.close()
		mainWindow = createAccountsWindow()
		createMainWindow = createAccountsWindow
		mainWindow.once('ready-to-show', () => {
			mainWindow.show()
		})
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
