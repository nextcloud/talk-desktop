/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { app, ipcMain, desktopCapturer, nativeImage, systemPreferences, shell, session } = require('electron')
const { default: mri } = require('mri')
const { spawn } = require('node:child_process')
const path = require('node:path')
const { setupMenu } = require('./app/app.menu.js')
const { loadAppConfig, getAppConfig, setAppConfig } = require('./app/AppConfig.ts')
const { appData } = require('./app/AppData.js')
const { registerAppProtocolHandler } = require('./app/appProtocol.ts')
const { verifyCertificate, promptCertificateTrust } = require('./app/certificate.service.ts')
const { cli } = require('./app/cli.ts')
const { openChromeWebRtcInternals } = require('./app/dev.utils.ts')
const { triggerDownloadUrl } = require('./app/downloads.ts')
const { setupReleaseNotificationScheduler, checkForUpdate } = require('./app/githubRelease.service.ts')
const { initLaunchAtStartupListener } = require('./app/launchAtStartup.config.ts')
const { runMigrations } = require('./app/migration.service.ts')
const { listNativeWindows, restoreNativeWindow } = require('./app/nativeWindows.ts')
const { systemInfo, isMac, isWindows, isSameExecution, isSquirrel, relaunchApp } = require('./app/system.utils.ts')
const { applyTheme } = require('./app/theme.config.ts')
const { buildTitle, onReadyToShow } = require('./app/utils.ts')
const { enableWebRequestInterceptor, disableWebRequestInterceptor } = require('./app/webRequestInterceptor.js')
const { createAuthenticationWindow } = require('./authentication/authentication.window.js')
const { openLoginWebView } = require('./authentication/login.window.js')
const { createCallboxWindow } = require('./callbox/callbox.window.ts')
const { createHelpWindow } = require('./help/help.window.js')
const { installVueDevtools } = require('./install-vue-devtools.js')
const { BUILD_CONFIG } = require('./shared/build.config.ts')
const { createTalkWindow } = require('./talk/talk.window.js')
const { createUpgradeWindow } = require('./upgrade/upgrade.window.ts')
const { createWelcomeWindow } = require('./welcome/welcome.window.ts')

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
if (require('electron-squirrel-startup')) {
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
/**
 * Extract the native window handle (HWND) encoded in an Electron window sourceId.
 * On Windows, Electron formats window sources as `window:<HWND>:<index>`.
 *
 * @param {string} sourceId - Electron desktopCapturer window sourceId
 * @return {number|null} The HWND as a number, or null if not a window source
 */
function parseHwndFromSourceId(sourceId) {
	const match = /^window:(\d+):\d+$/.exec(sourceId)
	return match ? Number(match[1]) : null
}

/**
 * Fetch and normalize Electron desktopCapturer sources (screens + windows).
 *
 * @return {Promise<Array<{ id: string, name: string, icon: string|null, thumbnail: string|null }>>}
 */
async function fetchDesktopCapturerSources() {
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
}

/**
 * Convert a native window icon (raw BGRA bitmap) into a data URL.
 * The bitmap uses straight alpha; Electron expects premultiplied BGRA on Windows.
 *
 * @param {{ width: number, height: number, data: Buffer }|null} icon - Raw window icon bitmap
 * @return {string|null}
 */
function windowIconToDataUrl(icon) {
	if (!icon || !icon.width || !icon.height || !icon.data || icon.data.length !== icon.width * icon.height * 4) {
		return null
	}
	try {
		const data = Buffer.from(icon.data)

		// Some legacy icons carry no alpha channel (all zero) and rely on a mask instead;
		// treat those as fully opaque so they are not rendered invisible.
		let hasAlpha = false
		for (let i = 3; i < data.length; i += 4) {
			if (data[i] !== 0) {
				hasAlpha = true
				break
			}
		}

		for (let i = 0; i < data.length; i += 4) {
			const alpha = hasAlpha ? data[i + 3] : 255
			data[i] = Math.round((data[i] * alpha) / 255)
			data[i + 1] = Math.round((data[i + 1] * alpha) / 255)
			data[i + 2] = Math.round((data[i + 2] * alpha) / 255)
			data[i + 3] = alpha
		}

		const image = nativeImage.createFromBitmap(data, { width: icon.width, height: icon.height })
		return image.isEmpty() ? null : image.toDataURL()
	} catch (error) {
		console.error('[main] Failed to build window icon:', error)
		return null
	}
}

ipcMain.handle('app:getDesktopCapturerSources', async () => {
	// macOS 10.15 Catalina or higher requires consent for screen access
	if (isMac && systemPreferences.getMediaAccessStatus('screen') !== 'granted') {
		// Open System Preferences to allow screen recording
		await shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture')
		// We cannot detect that the user has granted access, so return no sources
		// The user will have to try again after granting access
		return null
	}

	// On Windows, Chromium/WebRTC omits minimized (iconic) windows from desktopCapturer
	// because they are not rendered and cannot produce frames. Enumerate top-level windows
	// natively (in parallel) and add the minimized ones that are missing, so the user can
	// pick them. They are restored on selection (see app:activateWindowForCapture).
	// listNativeWindows() is best-effort and resolves to [] on any failure or non-Windows.
	const [sources, nativeWindows] = await Promise.all([
		fetchDesktopCapturerSources(),
		listNativeWindows(),
	])

	if (nativeWindows.length > 0) {
		const existingHwnds = new Set(sources.map((source) => parseHwndFromSourceId(source.id)).filter((hwnd) => hwnd !== null))
		for (const nativeWindow of nativeWindows) {
			if (nativeWindow.minimized && !existingHwnds.has(nativeWindow.hwnd)) {
				sources.push({
					id: `window:${nativeWindow.hwnd}:0`,
					name: nativeWindow.title,
					icon: windowIconToDataUrl(nativeWindow.icon),
					thumbnail: null,
					minimized: true,
				})
			}
		}
	}

	return sources
})

/**
 * Milliseconds to wait after restoring a window before capturing it, giving the
 * compositor time to render the freshly un-minimized window (otherwise the first
 * captured frames may be blank).
 */
const RESTORE_RENDER_DELAY_MS = 350

/**
 * Restore (un-minimize) a window selected for sharing.
 *
 * A minimized window produces no frames and cannot be captured by WebRTC. When the user picks
 * one, we restore it and give the compositor a moment to render it before capturing.
 * On Windows, Electron encodes the HWND in the window sourceId (`window:<HWND>:0`), so the id
 * stays valid after restoring and can be returned as-is.
 */
ipcMain.handle('app:activateWindowForCapture', async (event, source) => {
	if (!isWindows || !source?.id) {
		return { sourceId: source?.id ?? '' }
	}

	const hwnd = parseHwndFromSourceId(source.id)
	if (hwnd === null) {
		return { sourceId: source.id }
	}

	const restored = await restoreNativeWindow(hwnd)
	if (restored) {
		await new Promise((resolve) => setTimeout(resolve, RESTORE_RENDER_DELAY_MS))
	}

	return { sourceId: source.id }
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
