/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const semver = require('semver')
const { Notification, shell } = require('electron')
const packageJson = require('../../package.json')

/**
 * Cached new version. If a new version was found we may stop requesting a new version.
 *
 * @type {string|undefined}
 */
let cachedNewLatestVersion

/**
 * Request the latest release with GitHub REST API and get version from tag name
 *
 * @see https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#get-the-latest-release
 * @return {Promise<string>} Version tag, for example, v0.2.1
 */
async function getLatestReleaseVersion() {
	try {
		const response = await fetch('https://api.github.com/repos/nextcloud-releases/talk-desktop/releases/latest', {
			headers: {
				Accept: 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28',
			},
		})
		const data = await response.json()
		if (response.ok) {
			return data?.tag_name
		} else {
			console.error(data)
		}
	} catch (e) {
		console.error(e)
	}
}

/**
 * Show native notification about new version. It opens the releases page on click
 *
 * @param {string} version - New version
 */
function notifyAboutNewVersion(version) {
	const notification = new Notification({
		title: '🎉 New version of Nextcloud Talk is available!',
		body: `Nextcloud Talk ${version} is now available to download from the release page. Click to open the page.`,
	})
	notification.on('click', () => {
		shell.openExternal('https://github.com/nextcloud-releases/talk-desktop/releases/latest')
	})
	notification.show()
}

/**
 * Check if there is a new Nextcloud Talk
 *
 * @param {object} options options
 * @param {boolean} [options.showNotification] Show native notification if new version is available
 * @param {boolean} [options.forceRequest] Force request even if there is a cached new version
 * @return {Promise<boolean>} true if there is a new version
 */
async function checkForNewVersion({ showNotification = false, forceRequest = false }) {
	// Request new version or get cached
	const latest = (!forceRequest && cachedNewLatestVersion) ? cachedNewLatestVersion : await getLatestReleaseVersion()

	// Something goes wrong... No worries, we will try again later.
	if (!latest) {
		return false
	}

	if (semver.lte(latest, packageJson.version)) {
		return false
	}

	// There is a new version! Now we may cache it and stop requesting a new version
	cachedNewLatestVersion = latest

	if (showNotification) {
		notifyAboutNewVersion(latest)
	}

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
	checkForNewVersion({ showNotification: true })
	const MS_IN_MIN = 60 * 1000
	schedulerIntervalId = setInterval(() => {
		checkForNewVersion({ showNotification: true })
	}, intervalInMin * MS_IN_MIN)
}

/**
 * Stop the scheduler if any
 *
 * @return {void}
 */
function stopReleaseNotificationScheduler() {
	if (schedulerIntervalId) {
		clearInterval(schedulerIntervalId)
	}
}

module.exports = {
	getLatestReleaseVersion,
	notifyAboutNewVersion,
	checkForNewVersion,
	setupReleaseNotificationScheduler,
	stopReleaseNotificationScheduler,
}
