/*
 * @copyright Copyright (c) 2023 Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
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

const semver = require('semver')
const { Notification, shell } = require('electron')
const { fetch } = require('undici')
const packageJson = require('../../package.json')

/**
 * Request latest release with GitHub REST API and get version from tag name
 *
 * @see https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#get-the-latest-release
 * @return {Promise<string>} Version tag, for example, v0.2.1
 */
async function getLatestReleaseVersion() {
	try {
		const response = await fetch('https://api.github.com/repos/nextcloud/talk-desktop/releases/latest', {
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
 * Show native notification about new version. Opens releases page on click
 *
 * @param {string} version - New version
 */
function notifyAboutNewVersion(version) {
	const notification = new Notification({
		title: '🎉 New version of Nextcloud Talk is available!',
		body: `Nextcloud Talk ${version} is now available to download from the release page. Click to open the page.`,
	})
	notification.on('click', () => {
		shell.openExternal('https://github.com/nextcloud/talk-desktop/releases/latest')
	})
	notification.show()
}

/**
 * Check if there is a new Nextcloud Talk
 *
 * @param {boolean} [showNotification=false] Show native notification if new version is available
 * @return {Promise<boolean>} true if new version was found
 */
async function checkForNewVersion(showNotification = false) {
	const latest = await getLatestReleaseVersion()
	// Something goes wrong. No worries, we will try again later.
	if (!latest) {
		return false
	}
	if (semver.lte(latest, packageJson.version)) {
		return false
	}
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
 * @param {number} [intervalInMin=60] Checking interval in minutes
 * @return {void}
 */
function setupReleaseNotificationScheduler(intervalInMin = 60) {
	// Before run the scheduler - check and stop running scheduler
	if (schedulerIntervalId !== undefined) {
		stopReleaseNotificationScheduler()
	}
	checkForNewVersion(true)
	const MS_IN_MIN = 60 * 1000
	schedulerIntervalId = setInterval(() => {
		checkForNewVersion(true)
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
