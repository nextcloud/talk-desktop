/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const path = require('node:path')
const { app, dialog, BrowserWindow, ipcMain, desktopCapturer, systemPreferences, shell } = require('electron')
const { setupMenu } = require('./app/app.menu.js')
const { setupReleaseNotificationScheduler } = require('./app/githubReleaseNotification.service.js')
const { enableWebRequestInterceptor, disableWebRequestInterceptor } = require('./app/webRequestInterceptor.js')
const { createAuthenticationWindow } = require('./authentication/authentication.window.js')
const { openLoginWebView } = require('./authentication/login.window.js')
const { createHelpWindow } = require('./help/help.window.js')
const { createUpgradeWindow } = require('./upgrade/upgrade.window.js')
const { getOs, isLinux, isMac, isWayland, isWindows } = require('./shared/os.utils.js')
const { createTalkWindow } = require('./talk/talk.window.js')
const { createWelcomeWindow } = require('./welcome/welcome.window.js')
const { installVueDevtools } = require('./install-vue-devtools.js')
const { loadAppConfig, getAppConfig, setAppConfig } = require('./app/AppConfig.ts')
const { triggerDownloadUrl } = require('./app/downloads.ts')

/**
 * Parse command line arguments
 */
const ARGUMENTS = {
	// Open Talk window in the background, minimized to the system tray
	openInBackground: process.argv.includes('--background'),
}

/**
 * On production use executable name as application name to allow several independent application instances.
 * On development use "Nextcloud Talk (dev)" instead of the default "electron".
 */
const APP_NAME = process.env.NODE_ENV !== 'development' ? path.parse(app.getPath('exe')).name : 'Nextcloud Talk (dev)'
app.setName(APP_NAME)
app.setPath('userData', path.join(app.getPath('appData'), app.getName()))
if (isWindows()) {
	// TODO: get actual name from the build
	app.setAppUserModelId('com.squirrel.NextcloudTalk.NextcloudTalk')
}

/**
 * Handle creating/removing shortcuts on Windows when installing/uninstalling
 */
if (require('electron-squirrel-startup')) {
	app.quit()
}

/**
 * Only one instance is allowed at time
 */
if (!app.requestSingleInstanceLock()) {
	app.quit()
}

/**
 * Schedule check for a new version available to download from GitHub
 */
if (process.env.NODE_ENV === 'production') {
	setupReleaseNotificationScheduler(2 * 60)
}

ipcMain.on('app:quit', () => app.quit())
ipcMain.handle('app:getOs', () => getOs())
ipcMain.handle('app:getAppName', () => app.getName())
ipcMain.handle('app:getSystemL10n', () => ({
	locale: app.getLocale().replace('-', '_'),
	language: app.getPreferredSystemLanguages()[0].replace('-', '_'),
}))
ipcMain.handle('app:enableWebRequestInterceptor', (event, ...args) => enableWebRequestInterceptor(...args))
ipcMain.handle('app:disableWebRequestInterceptor', (event, ...args) => disableWebRequestInterceptor(...args))
ipcMain.handle('app:setBadgeCount', async (event, count) => app.setBadgeCount(count))
ipcMain.on('app:relaunch', () => {
	app.relaunch()
	app.exit(0)
})
ipcMain.handle('app:config:get', (event, key) => getAppConfig(key))
ipcMain.handle('app:config:set', (event, key, value) => setAppConfig(key, value))
ipcMain.handle('app:getDesktopCapturerSources', async () => {
	// macOS 10.15 Catalina or higher requires consent for screen access
	if (isMac() && systemPreferences.getMediaAccessStatus('screen') !== 'granted') {
		// Open System Preferences to allow screen recording
		await shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture')
		// We cannot detect that the user has granted access, so return no sources
		// The user will have to try again after granting access
		return null
	}

	// We cannot show live previews on Wayland, so we show thumbnails
	const thumbnailWidth = isWayland() ? 320 : 0

	const sources = await desktopCapturer.getSources({
		types: ['screen', 'window'],
		fetchWindowIcons: true,
		thumbnailSize: {
			width: thumbnailWidth,
			height: thumbnailWidth * 9 / 16,
		},
	})

	return sources.map((source) => ({
		id: source.id,
		name: source.name,
		icon: source.appIcon && !source.appIcon.isEmpty() ? source.appIcon.toDataURL() : null,
		thumbnail: source.thumbnail && !source.thumbnail.isEmpty() ? source.thumbnail.toDataURL() : null,
	}))
})

/**
 * Whether the window is being relaunched.
 * At this moment there are no active windows, but the application should not quit yet.
 */
let isInWindowRelaunch = false

app.whenReady().then(async () => {
	await loadAppConfig()

	try {
		await installVueDevtools()
	} catch (error) {
		console.log('Unable to install Vue Devtools')
		console.error(error)
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
		// Show window if it's hidden in the system tray and focus it
		mainWindow.show()
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
	welcomeWindow.once('ready-to-show', () => welcomeWindow.show())

	ipcMain.once('appData:receive', async (event, appData) => {
		if (appData.credentials) {
			// User is authenticated - setup and start main window
			enableWebRequestInterceptor(appData.serverUrl, {
				enableCors: true,
				enableCookies: true,
				credentials: appData.credentials,
			})
			mainWindow = createTalkWindow()
			createMainWindow = createTalkWindow
		} else {
			// User is unauthenticated - start login window
			await welcomeWindow.webContents.session.clearStorageData()
			mainWindow = createAuthenticationWindow()
			createMainWindow = createAuthenticationWindow
		}

		mainWindow.once('ready-to-show', () => {
			// Do not show the main window if it is the Talk Window opened in the background
			const isTalkWindow = createMainWindow === createTalkWindow
			if (!isTalkWindow || !ARGUMENTS.openInBackground) {
				mainWindow.show()
			}
			welcomeWindow.close()
		})
	})

	let macDockBounceId
	ipcMain.on('talk:flashAppIcon', async (event, shouldFlash) => {
		// MacOS has no "flashing" but "bouncing" of the dock icon
		if (isMac()) {
			// Stop previous bounce if any
			if (macDockBounceId) {
				app.dock.cancelBounce(macDockBounceId)
				macDockBounceId = undefined
			}
			// (Re)start bouncing if needed
			if (shouldFlash) {
				macDockBounceId = app.dock.bounce()
			}
		} else {
			// TODO: check if flashFrame also works on Mac since Electron 31
			mainWindow.flashFrame(shouldFlash)
		}
	})

	ipcMain.handle('talk:focus', async (event) => focusMainWindow())

	ipcMain.handle('authentication:openLoginWebView', async (event, serverUrl) => openLoginWebView(mainWindow, serverUrl))

	ipcMain.handle('authentication:login', async () => {
		mainWindow.close()
		mainWindow = createTalkWindow()
		createMainWindow = createTalkWindow
		mainWindow.once('ready-to-show', () => mainWindow.show())
	})

	ipcMain.handle('authentication:logout', async (event) => {
		if (createMainWindow === createTalkWindow) {
			await mainWindow.webContents.session.clearStorageData()
			const authenticationWindow = createAuthenticationWindow()
			createMainWindow = createAuthenticationWindow
			authenticationWindow.once('ready-to-show', () => authenticationWindow.show())

			mainWindow.destroy()
			mainWindow = authenticationWindow
		}
	})

	ipcMain.handle('help:show', () => {
		createHelpWindow(mainWindow)
	})

	ipcMain.handle('upgrade:show', () => {
		const upgradeWindow = createUpgradeWindow()
		createMainWindow = createUpgradeWindow

		mainWindow.destroy()
		mainWindow = upgradeWindow
	})

	ipcMain.on('app:relaunchWindow', () => {
		isInWindowRelaunch = true
		mainWindow.destroy()
		mainWindow = createMainWindow()
		mainWindow.once('ready-to-show', () => mainWindow.show())
		isInWindowRelaunch = false
	})

	ipcMain.on('app:downloadURL', (event, url, filename) => triggerDownloadUrl(mainWindow, url, filename))

	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			mainWindow = createMainWindow()
			mainWindow.once('ready-to-show', () => mainWindow.show())
		}
	})
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin' && !isInWindowRelaunch) {
		app.quit()
	}
})
