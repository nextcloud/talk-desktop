/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const path = require('node:path')
const fs = require('node:fs')
const { spawn } = require('node:child_process')
const { app, dialog, ipcMain, desktopCapturer, systemPreferences, shell, BrowserWindow } = require('electron')
const { setupMenu } = require('./app/app.menu.js')
const { setupReleaseNotificationScheduler } = require('./app/githubReleaseNotification.service.js')
const { enableWebRequestInterceptor, disableWebRequestInterceptor } = require('./app/webRequestInterceptor.js')
const { createAuthenticationWindow } = require('./authentication/authentication.window.js')
const { openLoginWebView } = require('./authentication/login.window.js')
const { createHelpWindow } = require('./help/help.window.js')
const { createUpgradeWindow } = require('./upgrade/upgrade.window.ts')
const { systemInfo, isLinux, isMac, isWindows } = require('./app/system.utils.ts')
const { createTalkWindow } = require('./talk/talk.window.js')
const { createWelcomeWindow } = require('./welcome/welcome.window.js')
const { installVueDevtools } = require('./install-vue-devtools.js')
const { loadAppConfig, getAppConfig, setAppConfig } = require('./app/AppConfig.ts')
const { appData } = require('./app/AppData.js')
const { triggerDownloadUrl } = require('./app/downloads.ts')
const { applyTheme } = require('./app/theme.config.ts')
const { initLaunchAtStartupListener } = require('./app/launchAtStartup.config.ts')
const { createCallboxWindow } = require('./callbox/callbox.window.ts')
const { openChromeWebRtcInternals } = require('./app/dev.utils.ts')

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
if (isWindows && process.env.NODE_ENV === 'production') {
	// Hacky way to detect whether the app is installed via Squirrel.Windows or MSI installer
	const updateExePath = path.join(path.dirname(app.getPath('exe')), '../Update.exe')
	const isSquirrel = fs.existsSync(updateExePath)
	if (isSquirrel) {
		// Squirrel.Windows sets the AppUserModelId in the following way
		app.setAppUserModelId('com.squirrel.NextcloudTalk.NextcloudTalk')
	} else {
		// MSI installer - normal AppID
		app.setAppUserModelId('com.nextcloud.talk')
	}
}

/**
 * Handle creating/removing shortcuts on Windows when installing/uninstalling
 */
if (require('electron-squirrel-startup')) {
	app.quit()
}

/**
 * Only one instance is allowed at the same time
 */
if (!app.requestSingleInstanceLock()) {
	app.quit()
}

/**
 * Schedule check for a new version available to download from GitHub
 */
if (process.env.NODE_ENV === 'production') {
	setupReleaseNotificationScheduler(24 * 60)
}

ipcMain.on('app:quit', () => app.quit())
ipcMain.handle('app:getSystemInfo', () => systemInfo)
ipcMain.handle('app:getTitle', (event) => BrowserWindow.fromWebContents(event.sender).title || app.getName())
ipcMain.handle('app:getSystemL10n', () => ({
	locale: app.getLocale().replace('-', '_') ?? 'en',
	// Note: Linux may have C (POSIX) locale, which results in an empty preferred languages list
	language: app.getPreferredSystemLanguages()[0]?.replace('-', '_') ?? 'en-US',
}))
ipcMain.handle('app:enableWebRequestInterceptor', (event, ...args) => enableWebRequestInterceptor(...args))
ipcMain.handle('app:disableWebRequestInterceptor', (event, ...args) => disableWebRequestInterceptor(...args))
ipcMain.handle('app:setBadgeCount', async (event, count) => {
	return app.setBadgeCount(count)
})
ipcMain.on('app:relaunch', () => {
	app.relaunch()
	app.exit(0)
})
ipcMain.handle('app:config:get', (event, key) => getAppConfig(key))
ipcMain.handle('app:config:set', (event, key, value) => setAppConfig(key, value))
ipcMain.on('app:toggleDevTools', (event) => event.sender.toggleDevTools())
ipcMain.handle('app:anything', () => { /* Put any code here to run it from UI */ })
ipcMain.on('app:openChromeWebRtcInternals', () => openChromeWebRtcInternals())
ipcMain.handle('app:getDesktopCapturerSources', async () => {
	// macOS 10.15 Catalina or higher requires consent for screen access
	if (isMac && systemPreferences.getMediaAccessStatus('screen') !== 'granted') {
		// Open System Preferences to allow screen recording
		await shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture')
		// We cannot detect that the user has granted access, so return no sources
		// The user will have to try again after granting access
		return null
	}

	const thumbnailWidth = 800

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
	applyTheme()
	initLaunchAtStartupListener()

	// Open in the background if it is explicitly set, or the app was open at login on macOS
	const openInBackground = ARGUMENTS.openInBackground || app.getLoginItemSettings().wasOpenedAtLogin

	try {
		// Note: legacy Vue devtools warns with "ExtensionLoadWarning: Manifest version 2 is deprecated, and support will be removed in 2024."
		// This is fine and works. New Vue devtools does not support Vue 2.
		await installVueDevtools()
	} catch (error) {
		console.log('Unable to install Vue Devtools')
		console.error(error)
	}

	if (process.env.NODE_ENV === 'development') {
		console.log()
		console.log('Nextcloud Talk is running via development server')
		console.log('Hint: type "rs" to restart app without restarting the build')
		console.log()
	}

	// TODO: add windows manager
	/**
	 * @type {import('electron').BrowserWindow}
	 */
	let mainWindow
	let createMainWindow

	setupMenu()

	/**
	 * Focus the main window. Restore/re-create it if needed.
	 */
	function focusMainWindow() {
		// There is no main window at all, the app is not initialized yet - ignore
		if (!createMainWindow) {
			return
		}

		// There is no window (possible on macOS) - create
		if (!mainWindow || mainWindow.isDestroyed()) {
			mainWindow = createMainWindow()
			mainWindow.once('ready-to-show', () => mainWindow.show())
			return
		}

		// The window is minimized - restore
		if (mainWindow.isMinimized()) {
			mainWindow.restore()
		}

		// Show the window in case it is hidden in the system tray and focus it
		mainWindow.show()
	}

	/**
	 * Instead of creating a new app instance - focus existence one
	 */
	app.on('second-instance', (event, argv, cwd) => {
		// Instead of creating a new application instance - focus the current window
		const secondInstanceExecPath = path.isAbsolute(argv[0]) ? argv[0] : path.resolve(cwd, argv[0])
		if (process.execPath === secondInstanceExecPath) {
			focusMainWindow()
			return
		}

		// The second instance is another installation
		// Open the new instance and close the current one
		app.releaseSingleInstanceLock()
		try {
			const newInstance = spawn(path.resolve(argv[0]), argv.slice(1), {
				cwd,
				detached: true,
				stdio: 'ignore',
			}).on('spawn', () => {
				newInstance.unref()
				app.quit()
			}).on('error', (error) => {
				console.error('Failed to switch to the second instance', error)
			})
		} catch (error) {
			console.error('Failed to switch to the second instance', error)
		}
	})

	app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
		event.preventDefault()

		if (isLinux) {
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

	mainWindow = createWelcomeWindow()
	createMainWindow = createWelcomeWindow
	mainWindow.once('ready-to-show', () => mainWindow.show())

	ipcMain.once('appData:receive', async (event, newAppData) => {
		appData.fromJSON(newAppData)

		const welcomeWindow = mainWindow

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
			if (!isTalkWindow || !openInBackground) {
				mainWindow.show()
			}
			welcomeWindow.close()
		})
	})

	let macDockBounceId
	ipcMain.on('talk:flashAppIcon', async (event, shouldFlash) => {
		// MacOS has no "flashing" but "bouncing" of the dock icon
		if (isMac) {
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

	ipcMain.on('callbox:show', (event, callboxParams) => {
		createCallboxWindow(callboxParams)
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

	// Click on the dock icon on macOS
	app.on('activate', () => {
		if (mainWindow && !mainWindow.isDestroyed()) {
			// Show the main window if it exists but hidden (not closed), e.g., minimized to the system tray
			mainWindow.show()
		} else {
			// On macOS, it is common to re-create a window in the app when the
			// dock icon is clicked and there are no other windows open.
			// See window-all-closed event handler.
			mainWindow = createMainWindow()
			mainWindow.once('ready-to-show', () => mainWindow.show())
		}
	})
})

app.on('window-all-closed', () => {
	// Recreating a window - keep app running
	if (isInWindowRelaunch) {
		return
	}

	// On macOS, it is common for applications and their menu bar to stay active even without windows
	// until the user quits explicitly with Cmd + Q or Quit from the menu.
	if (isMac) {
		return
	}

	// All the windows are closed - quit the app
	app.quit()
})
