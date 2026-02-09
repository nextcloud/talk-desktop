/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { BrowserWindow, ipcMain } = require('electron')
const semver = require('semver')
const packageJson = require('../../package.json')

/**
 * Cached new version. If a new version was found we may stop requesting a new version.
 *
 * @type {string|undefined}
 */
let cachedNewLatestVersion

/**
 * Request the latest release version of Nextcloud Talk on GitHub releases
 *
 * @param {boolean} beta - Whether to use beta release channel
 * @return {Promise<string>} Version tag, for example, v1.0.2-beta
 */
function getLatestReleaseVersion(beta = false) {
	return beta ? getLatestBetaReleaseVersion() : getLatestStableReleaseVersion()
}

/**
 * Request the latest beta release version of Nextcloud Talk on GitHub releases
 *
 * @see https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28
 * @return {Promise<string>} Version tag, for example, v1.0.2-beta
 */
async function getLatestBetaReleaseVersion() {
	try {
		const response = await fetch('https://api.github.com/repos/nextcloud-releases/talk-desktop/releases', {
			headers: {
				Accept: 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28',
			},
		})
		const releases = await response.json()
		if (response.ok) {
			return semver.maxSatisfying(releases.map((release) => release.tag_name), '*', { includePrerelease: true })
		}
	} catch (e) {
		console.error(e)
	}
}

/**
 * Request the latest stable release version of Nextcloud Talk on GitHub releases
 *
 * @see https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#get-the-latest-release
 * @return {Promise<string>} Version tag, for example, v1.0.2
 */
async function getLatestStableReleaseVersion() {
	try {
		const response = await fetch('https://api.github.com/repos/nextcloud-releases/talk-desktop/releases/latest', {
			headers: {
				Accept: 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28',
			},
		})
		const release = await response.json()
		if (response.ok) {
			return release.tag_name
		}
	} catch (e) {
		console.error(e)
	}
}

/**
 * Check if there is a new Nextcloud Talk
 *
 * @param {object} options options
 * @param {boolean} [options.forceRequest] Force request even if there is a cached new version
 * @return {Promise<boolean>} true if there is a new version
 */
async function checkForNewVersion({ forceRequest = false }) {
	const latest = (!forceRequest && cachedNewLatestVersion) ? cachedNewLatestVersion : await getLatestReleaseVersion(__CHANNEL__ === 'beta')

	// Something goes wrong... No worries, we will try again later.
	if (!latest) {
		return false
	}

	// No new version compared to the running one
	if (semver.lte(latest, packageJson.version)) {
		return false
	}

	// There is a new version! Cache it and notify renderers
	cachedNewLatestVersion = latest

	// Send an IPC message to all renderer windows so UI can update
	BrowserWindow.getAllWindows().forEach((window) => {
		window.webContents.send('github-release:new-version')
	})

	return true
}

/** @type {number} setInterval id of the scheduler */
let schedulerIntervalId

/**
 * Start scheduler with regular update checks
 *
 * @param {number} [intervalInMin] Checking an interval in minutes
 * @return {void}
 */
function setupReleaseNotificationScheduler(intervalInMin = 60) {
	// Before run the scheduler - check and stop running scheduler
	if (schedulerIntervalId !== undefined) {
		stopReleaseNotificationScheduler()
	}
	checkForNewVersion({ })
	const MS_IN_MIN = 60 * 1000
	schedulerIntervalId = setInterval(() => {
		checkForNewVersion({ })
	}, intervalInMin * MS_IN_MIN)
}

/**
 * Stop the scheduler if any
 *
 * @return {void}
 */
function stopReleaseNotificationScheduler() {
	if (schedulerIntervalId !== undefined) {
		clearInterval(schedulerIntervalId)
		schedulerIntervalId = undefined
	}
}

/**
 * Register IPC handlers used by renderers
 */
function registerUpdateIpcHandlers() {
	ipcMain.handle('github-release:check', async () => {
		try {
			const result = await checkForNewVersion({ })
			return { available: !!result }
		} catch (e) {
			console.error('github-release:check handler failed', e)
			return { available: false }
		}
	})
}

module.exports = {
	setupReleaseNotificationScheduler,
	registerUpdateIpcHandlers,
}
