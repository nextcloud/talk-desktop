/*!
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { BrowserWindow } from 'electron'
import semver from 'semver'
import { version } from '../../package.json'

/**
 * Cached new version. If a new version was found we may stop requesting a new version.
 */
let cachedNewLatestVersion: string | undefined

/**
 * Request the latest release version of Nextcloud Talk on GitHub releases
 *
 * @param beta - Whether to use beta release channel
 * @return Version tag, for example, v1.0.2-beta
 */
function getLatestReleaseVersion(beta: boolean = false): Promise<string | null> {
	return beta ? getLatestBetaReleaseVersion() : getLatestStableReleaseVersion()
}

/**
 * Request the latest beta release version of Nextcloud Talk on GitHub releases
 *
 * @see https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28
 * @return Version tag, for example, v1.0.2-beta
 */
async function getLatestBetaReleaseVersion(): Promise<string | null> {
	try {
		const response = await fetch('https://api.github.com/repos/nextcloud-releases/talk-desktop/releases', {
			headers: {
				Accept: 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28',
			},
		})
		const releases = await response.json() as { tag_name: string }[]
		if (response.ok) {
			return semver.maxSatisfying(releases.map((release) => release.tag_name), '*', { includePrerelease: true })
		}
	} catch (e) {
		console.error(e)
	}
	return null
}

/**
 * Request the latest stable release version of Nextcloud Talk on GitHub releases
 *
 * @see https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#get-the-latest-release
 * @return Version tag, for example, v1.0.2
 */
async function getLatestStableReleaseVersion(): Promise<string | null> {
	try {
		const response = await fetch('https://api.github.com/repos/nextcloud-releases/talk-desktop/releases/latest', {
			headers: {
				Accept: 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28',
			},
		})
		const release = await response.json() as { tag_name: string }
		if (response.ok) {
			return release.tag_name
		}
	} catch (e) {
		console.error(e)
	}
	return null
}

/**
 * Check if there is a new Nextcloud Talk
 *
 * @param options - options
 * @param options.forceRequest - Force request even if there is a cached new version
 * @return true if there is a new version
 */
export async function checkForUpdate({ forceRequest = false }: { forceRequest?: boolean }): Promise<boolean> {
	const latest = (!forceRequest && cachedNewLatestVersion) ? cachedNewLatestVersion : await getLatestReleaseVersion(__CHANNEL__ === 'beta')

	// Something goes wrong... No worries, we will try again later.
	if (!latest) {
		return false
	}

	// No new version compared to the running one
	if (semver.lte(latest, version)) {
		return false
	}

	// There is a new version! Cache it and notify renderers
	cachedNewLatestVersion = latest

	// Send an IPC message to all renderer windows so UI can update
	BrowserWindow.getAllWindows().forEach((window) => {
		window.webContents.send('app:update:available')
	})

	return true
}

let schedulerIntervalId: NodeJS.Timeout | undefined

/**
 * Start scheduler with regular update checks
 *
 * @param intervalInMin - Checking interval in minutes
 */
export function setupReleaseNotificationScheduler(intervalInMin: number = 60) {
	// Before run the scheduler - check and stop running scheduler
	if (schedulerIntervalId !== undefined) {
		stopReleaseNotificationScheduler()
	}
	checkForUpdate({ })
	const MS_IN_MIN = 60 * 1000
	schedulerIntervalId = setInterval(() => {
		checkForUpdate({ })
	}, intervalInMin * MS_IN_MIN)
}

/**
 * Stop the scheduler if any
 */
function stopReleaseNotificationScheduler() {
	if (schedulerIntervalId !== undefined) {
		clearInterval(schedulerIntervalId)
		schedulerIntervalId = undefined
	}
}
