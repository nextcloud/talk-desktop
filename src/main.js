/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { app, desktopCapturer, ipcMain, session, shell, systemPreferences } from 'electron'
import mri from 'mri'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { setupMenu } from './app/app.menu.js'
import { getAppConfig, loadAppConfig, setAppConfig } from './app/AppConfig.ts'
import { appData } from './app/AppData.js'
import { registerAppProtocolHandler } from './app/appProtocol.ts'
import { promptCertificateTrust, verifyCertificate } from './app/certificate.service.ts'
import { cli } from './app/cli.ts'
import { openChromeWebRtcInternals } from './app/dev.utils.ts'
import { triggerDownloadUrl } from './app/downloads.ts'
import { checkForUpdate, setupReleaseNotificationScheduler } from './app/githubRelease.service.ts'
import { initLaunchAtStartupListener } from './app/launchAtStartup.config.ts'
import { runMigrations } from './app/migration.service.ts'
import { isMac, isSameExecution, isSquirrel, isWindows, relaunchApp, systemInfo } from './app/system.utils.ts'
import { applyTheme } from './app/theme.config.ts'
import { buildTitle, onReadyToShow } from './app/utils.ts'
import { disableWebRequestInterceptor, enableWebRequestInterceptor } from './app/webRequestInterceptor.js'
import { createAuthenticationWindow } from './authentication/authentication.window.js'
import { openLoginWebView } from './authentication/login.window.js'
import { createCallboxWindow } from './callbox/callbox.window.ts'
import { createHelpWindow } from './help/help.window.js'
import { installVueDevtools } from './install-vue-devtools.js'
import { BUILD_CONFIG } from './shared/build.config.ts'
import { createTalkWindow } from './talk/talk.window.js'
import { createUpgradeWindow } from './upgrade/upgrade.window.ts'
import { createWelcomeWindow } from './welcome/welcome.window.ts'

const argv = mri(process.argv.slice(app.isPackaged ? 1 : 2))

/**
 * On production use executable name as application name to allow several independent application instances.
 * On development use "Nextcloud Talk (dev)" instead of the default "electron".
 */
const APP_NAME = process.env.NODE_ENV !== 'development' ? path.parse(app.getPath('exe')).name : 'Nextcloud Talk (dev)'
app.setName(APP_NAME)
app.setPath('userData', path.join(app.getPath('appData'), app.getName()))
if (isWindows && process.env.NODE_ENV === 'production') {
	if (isSquirrel) {
		// Squirrel.Windows sets the AppUserModelId in the following way
		app.setAppUserModelId(`com.squirrel.${BUILD_CONFIG.applicationNameSanitized}.${BUILD_CONFIG.applicationNameSanitized}`)
	} else {
		// MSI installer - normal AppID
		app.setAppUserModelId(BUILD_CONFIG.winAppId)
	}
}

/**
 * Handle creating/removing shortcuts on Windows when installing/uninstalling
 */
if ((await import('electron-squirrel-startup')).default) {
	app.quit()
}

/**
 * Only one instance is allowed at the same time
 */
if (!app.requestSingleInstanceLock()) {
	console.log('Another instance of the app is already running')
	app.quit()
}

ipcMain.on('app:quit', () => app.quit())
ipcMain.handle('app:getSystemInfo', () => systemInfo)
ipcMain.handle('app:buildTitle', (event, title) => buildTitle(title))
ipcMain.handle('app:getSystemL10n', () => ({
	locale: app.getLocale().replace('-', '_') ?? 'en',
	// Note: Linux may have C (POSIX) locale, which results in an empty preferred languages list
	language: app.getPreferredSystemLanguages()[0]?.replace('-', '_') ?? 'en_US',
}))
ipcMain.handle('app:enableWebRequestInterceptor', (event, ...args) => enableWebRequestInterceptor(...args))
ipcMain.handle('app:disableWebRequestInterceptor', (event, ...args) => disableWebRequestInterceptor(...args))
ipcMain.handle('app:setBadgeCount', async (event, count) => app.setBadgeCount(count))
ipcMain.on('app:relaunch', () => relaunchApp())
ipcMain.handle('app:config:get', (event, key) => getAppConfig(key))
ipcMain.handle('app:config:set', (event, key, value) => setAppConfig(key, value))
ipcMain.on('app:grantUserGesturedPermission', (event, id) => {
	return event.sender.executeJavaScript(`document.getElementById('${id}')?.click()`, true)
})
ipcMain.on('app:toggleDevTools', (event) => event.sender.toggleDevTools())
ipcMain.handle('app:anything', () => { /* Put any code here to run it from UI */ })
ipcMain.on('app:openChromeWebRtcInternals', () => openChromeWebRtcInternals())
ipcMain.handle('app:update:check', async () => await checkForUpdate({ forceRequest: true }))
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
	await runMigrations()

	await cli(argv)

	applyTheme()
	initLaunchAtStartupListener()
	registerAppProtocolHandler()

	/**
	 * Schedule check for a new version available to download from GitHub
	 */
	if (process.env.NODE_ENV === 'production' && !BUILD_CONFIG.isBranded) {
		setupReleaseNotificationScheduler(24 * 60)
	}

	// Open in the background if it is explicitly set, or the app was open at login on macOS
	const openInBackground = argv.background || app.getLoginItemSettings().wasOpenedAtLogin

	try {
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
			onReadyToShow(mainWindow, () => mainWindow.show())
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
		if (isSameExecution(argv[0], cwd)) {
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

	// Allow requests to a server with accepted untrusted certificate
	// Note: the result of this verification is cached by domain in Electron
	// There is no way to clean the cache except by restarting the app
	session.defaultSession.setCertificateVerifyProc(async (request, callback) => {
		const isAccepted = request.errorCode === 0 || await promptCertificateTrust(mainWindow, request)
		callback(isAccepted ? 0 : -3)
	})

	// Allow web-view with accepted untrusted certificate (Login Flow)
	app.on('certificate-error', async (event, webContents, url, error, certificate, callback) => {
		event.preventDefault()
		const isAccepted = await promptCertificateTrust(mainWindow, { hostname: new URL(url).hostname, certificate, verificationResult: error })
		callback(isAccepted)
	})

	mainWindow = createWelcomeWindow()
	createMainWindow = createWelcomeWindow
	onReadyToShow(mainWindow, () => mainWindow.show())

	ipcMain.once('appData:receive', async (event, newAppData) => {
		appData.fromJSON(newAppData)

		const welcomeWindow = mainWindow

		if (appData.credentials) {
			// User is authenticated - setup and start main window
			enableWebRequestInterceptor(appData.serverUrl, {
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

		onReadyToShow(mainWindow, () => {
			// Do not show the main window if it is the Talk Window opened in the background
			const isTalkWindow = createMainWindow === createTalkWindow
			if (!isTalkWindow || !openInBackground) {
				mainWindow.show()
			}
			welcomeWindow.close()
		})
	})

	ipcMain.handle('appData:get', () => appData.toJSON())

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

	ipcMain.handle('talk:focus', async () => focusMainWindow())

	ipcMain.handle('authentication:openLoginWebView', async (event, serverUrl, user) => openLoginWebView(mainWindow, serverUrl, user))

	ipcMain.handle('authentication:login', async (event, newAppData) => {
		appData.fromJSON(newAppData)
		mainWindow.close()
		mainWindow = createTalkWindow()
		createMainWindow = createTalkWindow
		onReadyToShow(mainWindow, () => mainWindow.show())
	})

	ipcMain.handle('authentication:logout', async () => {
		if (createMainWindow === createTalkWindow) {
			appData.reset()
			await mainWindow.webContents.session.clearStorageData()
			app.setBadgeCount(0)
			const authenticationWindow = createAuthenticationWindow()
			createMainWindow = createAuthenticationWindow
			onReadyToShow(authenticationWindow, () => authenticationWindow.show())

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
		onReadyToShow(mainWindow, () => mainWindow.show())
		isInWindowRelaunch = false
	})

	ipcMain.on('app:downloadURL', (event, url, filename) => triggerDownloadUrl(mainWindow, url, filename))

	ipcMain.handle('certificate:verify', (event, url) => verifyCertificate(mainWindow, url))

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
			onReadyToShow(mainWindow, () => mainWindow.show())
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
