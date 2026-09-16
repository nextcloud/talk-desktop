/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { BrowserWindow, screen } = require('electron')
const { setupTray } = require('../app/app.tray.js')
const { getAppConfig, setAppConfig } = require('../app/AppConfig.ts')
const { applyContextMenu } = require('../app/applyContextMenu.js')
const { applyDownloadHandler } = require('../app/downloads.ts')
const { applyExternalLinkHandler } = require('../app/externalLinkHandlers.ts')
const { getScaledWindowMinSize, getScaledWindowSize, applyZoom, buildTitle, getWindowUrl, getTitleBarSymbolColor } = require('../app/utils.ts')
const { applyWheelZoom } = require('../app/zoom.service.ts')
const { TITLE_BAR_HEIGHT } = require('../constants.js')
const { BUILD_CONFIG } = require('../shared/build.config.ts')
const { getBrowserWindowIcon } = require('../shared/icons.utils.js')

const SAVE_WINDOW_BOUNDS_DELAY = 500

/**
 * Check whether a value can be used as Electron window bounds.
 *
 * @param {unknown} bounds - Candidate window bounds
 * @return {boolean} Whether the value is a valid window bounds object
 */
function isValidWindowBounds(bounds) {
	return typeof bounds === 'object'
		&& bounds !== null
		&& Number.isFinite(bounds.x)
		&& Number.isFinite(bounds.y)
		&& Number.isFinite(bounds.width)
		&& Number.isFinite(bounds.height)
		&& bounds.width > 0
		&& bounds.height > 0
}

/**
 * Check whether saved bounds still overlap with an available display.
 *
 * @param {import('electron').Rectangle} bounds - Window bounds to check
 * @return {boolean} Whether the bounds are visible on any display
 */
function isVisibleOnAnyDisplay(bounds) {
	return screen.getAllDisplays().some(({ workArea }) => (
		bounds.x < workArea.x + workArea.width
		&& bounds.x + bounds.width > workArea.x
		&& bounds.y < workArea.y + workArea.height
		&& bounds.y + bounds.height > workArea.y
	))
}

/**
 * Get saved Talk window bounds if they are still usable.
 *
 * @param {{ minWidth: number, minHeight: number }} minimumSize - Minimum Talk window size
 * @return {import('electron').Rectangle | undefined} Restorable bounds, if available
 */
function getSavedTalkWindowBounds(minimumSize) {
	const bounds = getAppConfig('talkWindowBounds')
	if (!isValidWindowBounds(bounds)) {
		return undefined
	}

	const savedBounds = {
		...bounds,
		width: Math.max(bounds.width, minimumSize.minWidth),
		height: Math.max(bounds.height, minimumSize.minHeight),
	}

	return isVisibleOnAnyDisplay(savedBounds) ? savedBounds : undefined
}

/**
 * Persist Talk window bounds as they change.
 *
 * @param {import('electron').BrowserWindow} window - Talk window to persist
 */
function applyTalkWindowBoundsPersistence(window) {
	let saveWindowBoundsTimeout

	/**
	 * Save the current normal bounds immediately.
	 */
	function saveWindowBounds() {
		clearTimeout(saveWindowBoundsTimeout)
		if (window.isDestroyed()) {
			return
		}

		setAppConfig('talkWindowBounds', window.getNormalBounds())
	}

	/**
	 * Debounce repeated move and resize events.
	 */
	function scheduleSaveWindowBounds() {
		clearTimeout(saveWindowBoundsTimeout)
		saveWindowBoundsTimeout = setTimeout(saveWindowBounds, SAVE_WINDOW_BOUNDS_DELAY)
	}

	window.on('move', scheduleSaveWindowBounds)
	window.on('moved', scheduleSaveWindowBounds)
	window.on('resize', scheduleSaveWindowBounds)
	window.on('resized', scheduleSaveWindowBounds)
	window.on('close', saveWindowBounds)
	window.on('closed', () => clearTimeout(saveWindowBoundsTimeout))
}

/**
 * @return {import('electron').BrowserWindow}
 */
function createTalkWindow() {
	const zoomFactor = getAppConfig('zoomFactor')
	const minimumSize = getScaledWindowMinSize({
		minWidth: 600,
		minHeight: 400,
	})
	const defaultSize = getScaledWindowSize({
		width: 1400,
		height: 900,
	})
	const savedBounds = getSavedTalkWindowBounds(minimumSize)

	const talkWindowOptions = {
		title: buildTitle(),
		...minimumSize,
		backgroundColor: BUILD_CONFIG.backgroundColor,
		autoHideMenuBar: true,
		webPreferences: {
			preload: TALK_DESKTOP__WINDOW_TALK_PRELOAD_WEBPACK_ENTRY,
			zoomFactor,
		},
		icon: getBrowserWindowIcon(),
		titleBarStyle: getAppConfig('systemTitleBar') ? 'default' : 'hidden',
		titleBarOverlay: {
			color: '#FFFFFF00',
			symbolColor: getTitleBarSymbolColor(),
			height: Math.round(TITLE_BAR_HEIGHT * zoomFactor),
		},
		// Position of the top left corner of the traffic light on Mac
		trafficLightPosition: {
			x: 12, // In line with SearchBox
			y: Math.round((TITLE_BAR_HEIGHT * zoomFactor - 16) / 2), // 16 is the default traffic light button diameter
		},
	}

	const window = new BrowserWindow({
		...talkWindowOptions,
		...defaultSize,
		...savedBounds,
		show: false,
	})

	// TODO: return it on release
	/*
	if (process.env.NODE_ENV === 'production') {
		window.removeMenu()
	}
	 */

	applyExternalLinkHandler(window, {
		...talkWindowOptions,
		...getScaledWindowSize({
			width: 800,
			height: 600,
		}),
	})

	applyContextMenu(window)
	applyDownloadHandler(window)
	applyWheelZoom(window)
	applyZoom(window)
	applyTalkWindowBoundsPersistence(window)

	setupTray(window)

	window.loadURL(getWindowUrl('talk') + '#/apps/spreed')

	return window
}

module.exports = {
	createTalkWindow,
}
