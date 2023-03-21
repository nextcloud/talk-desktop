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

const path = require('node:path')
const {
	app,
	dialog,
	BrowserWindow,
	ipcMain,
} = require('electron')
const {
	default: installExtension,
	VUEJS3_DEVTOOLS,
} = require('electron-devtools-installer')
const { createTalkWindow } = require('./talk/talk.window.js')
const { createAuthenticationWindow } = require('./authentication/authentication.window.js')
const { openLoginWebView } = require('./authentication/login.window.js')
const { createWelcomeWindow } = require('./welcome/welcome.window.js')
const { setTimeout } = require('timers/promises')
const {
	enableWebRequestInterceptor,
	disableWebRequestInterceptor,
} = require('./app/webRequestInterceptor.js')
const { getOs, isLinux } = require('./shared/os.utils.js')
const { setupMenu } = require('./app/app.menu.js')
const { createHelpWindow } = require('./help/help.window.js')

/**
 * Only one instance is allowed at time
 */
if (!app.requestSingleInstanceLock()) {
	app.quit()
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
//   app.quit();
// }

ipcMain.handle('app:getOs', () => getOs())
ipcMain.handle('app:enableWebRequestInterceptor', (event, ...args) => enableWebRequestInterceptor(...args))
ipcMain.handle('app:disableWebRequestInterceptor', (event, ...args) => disableWebRequestInterceptor(...args))
ipcMain.handle('app:setBadgeCount', async (event, count) => app.setBadgeCount(count))

// Separate production and development appData
if (process.env.NODE_ENV === 'development') {
	app.setName('Nextcloud Talk (dev)')
	app.setPath('userData', path.join(app.getPath('appData'), 'Nextcloud Talk (dev)'))
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

	setupMenu()

	const focusMainWindow = () => {
		if (mainWindow.isMinimized()) {
			mainWindow.restore()
		}
		mainWindow.focus()
	}

	/**
	 * Instead of creating a new app instance - focus existence one
	 */
	app.on('second-instance', () => focusMainWindow())

	app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
		event.preventDefault()

		if (isLinux()) {
			return callback(process.env.NODE_ENV !== 'production')
		}

		dialog.showCertificateTrustDialog(mainWindow, {
			certificate,
			message: 'Untrusted certificate',
		}).then(() => {
			callback(true)
		}).catch(() => {
			callback(false)
		})

		// TODO: showCertificateTrustDialog supports only Windows and Mac OS. Create custom window on Linux:
		/* dialog.showMessageBox(mainWindow, {
			type: 'warning',
			title: 'Security Warning',
			detail:
				[
					`Error: ${error}`,
					'',
					`Subject: ${certificate.subjectName}`,
					'',
					`Issuer: ${certificate.issuerName ?? 'UNKNOWN'}`,
					`- Organisations: ${certificate.issuer.organizations.join(', ')}`,
					`- Organisation units: ${certificate.issuer.organizationUnits.join(', ')}`,
					`- Country: ${certificate.issuer.country}`,
					`- State: ${certificate.issuer.state}`,
					`- Locality: ${certificate.issuer.locality}`,
					'',
					`Fingerprint: ${certificate.fingerprint}`,
					'',
					`Valid from: ${new Date(certificate.validStart * 1_000).toLocaleDateString()}`,
					`Valid until: ${new Date(certificate.validExpiry * 1_000).toLocaleDateString()}`,
					'',
					'Do you trust this certificate?',
				].join('\n'),
			buttons: ['Yes', 'Cancel'],
		})
 		*/
	})

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
		await setTimeout(5000)
	}

	// TODO: handle JSON parsing error
	const maybeAppData = await welcomeWindow.webContents.executeJavaScript('JSON.parse(localStorage[\'AppData\'] ?? null)')
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
		mainWindow = createAuthenticationWindow()
		createMainWindow = createAuthenticationWindow
	}

	mainWindow.once('ready-to-show', () => {
		mainWindow.show()
		welcomeWindow.close()
	})

	ipcMain.handle('talk:focus', async (event) => focusMainWindow())

	ipcMain.handle('authentication:openLoginWebView', async (event, serverUrl) => openLoginWebView(mainWindow, serverUrl))

	ipcMain.handle('authentication:login', async () => {
		mainWindow.close()
		mainWindow = createTalkWindow()
		createMainWindow = createTalkWindow
	})

	ipcMain.handle('authentication:logout', async (event) => {
		if (createMainWindow === createTalkWindow) {
			await mainWindow.webContents.session.clearStorageData()
			mainWindow.close()
			mainWindow = createAuthenticationWindow()
			createMainWindow = createAuthenticationWindow
			mainWindow.once('ready-to-show', () => {
				mainWindow.show()
			})
		}
	})

	ipcMain.handle('help:show', () => {
		createHelpWindow(mainWindow)
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
