/*!
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { BrowserWindow } from 'electron'
import lte from 'semver/functions/lte.js'
import rcompare from 'semver/functions/rcompare.js'
import { version } from '../../package.json'
import { BUILD_CONFIG } from '../shared/build.config.ts'
import { currentInstallerExt, isMac, platformTitle } from './system.utils.ts'

export type ReleaseInfo = {
	/** Version tag, e.g., "v1.0.0" */
	version: string
	/** Whether the release is a beta version, e.g., "v1.0.0-beta" */
	beta: boolean
	/** URL to the release page on GitHub */
	url: string
	/** New version installer if available for the current installation */
	installer?: {
		/** Filename of the installer, e.g., "Nextcloud.Talk-windows-x64.msi", if available */
		filename: string
		/** Direct download URL for the installer, if available */
		downloadUrl: string
	}
}

/**
 * Get the latest and stable releases
 */
async function getLatestRelease(): Promise<{ latest?: ReleaseInfo, stable?: ReleaseInfo }> {
	type GitHubReleaseResponse = {
		tag_name: string
		prerelease: boolean
		draft: boolean
		html_url: string
		assets: {
			name: string
			browser_download_url: string
		}[]
	}

	const mapGitHubReleaseToReleaseInfo = (release?: GitHubReleaseResponse): ReleaseInfo | undefined => (
		release && {
			version: release.tag_name,
			beta: release.prerelease,
			url: release.html_url,
			installer: release.assets
				.map((asset) => ({
					filename: asset.name,
					downloadUrl: asset.browser_download_url,
				}))
				.find((installer) => (
					installer.filename.startsWith(BUILD_CONFIG.applicationName.replace(/[^a-z0-9]/gi, '.'))
					&& installer.filename.includes(`-${platformTitle.toLowerCase()}-`)
					// We don't know to which architecture the app was build
					// But currently there are no alternatives, each OS has only one arch installer available
					// Checking it in case more installers are added in future (windows/linux arm64 or nor universal macOS)
					&& installer.filename.includes(isMac ? '-universal' : '-x64')
					&& installer.filename.endsWith(`.${currentInstallerExt}`))),
		})

	try {
		// Ref: https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28
		const response = await fetch('https://api.github.com/repos/nextcloud-releases/talk-desktop/releases', {
			headers: {
				Accept: 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28',
			},
		})

		if (!response.ok) {
			return {
				latest: undefined,
				stable: undefined,
			}
		}

		if (response.ok) {
			const releases = (await response.json() as GitHubReleaseResponse[])
				// GitHub releases may include drafts which haven't been actually released yet
				.filter((release) => !release.draft)
				// GitHub releases are ordered by date (ID), but we need the latest by semantic version
				.sort((a, b) => rcompare(a.tag_name, b.tag_name))

			return {
				latest: mapGitHubReleaseToReleaseInfo(releases[0]),
				stable: mapGitHubReleaseToReleaseInfo(releases.find((release) => !release.prerelease)),
			}
		}
	} catch (e) {
		console.error(e)
	}

	return {
		latest: undefined,
		stable: undefined,
	}
}

/**
 * Cached new version. If a new version was found we may stop requesting a new version.
 */
let cachedNewRelease: ReleaseInfo | null = null

/**
 * Check if there is a new Nextcloud Talk
 *
 * @param options - options
 * @param options.forceRequest - Force request even if there is a cached new version
 * @return true if there is a new version
 */
export async function checkForUpdate({ forceRequest = false }: { forceRequest?: boolean } = {}): Promise<ReleaseInfo | null> {
	if (cachedNewRelease && !forceRequest) {
		return cachedNewRelease
	}

	// Until we have the release channel in the settings, provide only the current
	const latest = (await getLatestRelease())[__CHANNEL__ === 'stable' ? 'stable' : 'latest']

	// Something went wrong...
	if (!latest) {
		return null
	}

	if (lte(latest.version, version)) {
		return null
	}

	cachedNewRelease = latest

	BrowserWindow.getAllWindows().forEach((window) => {
		window.webContents.send('app:update:available', latest)
	})

	return latest
}

let schedulerIntervalId: NodeJS.Timeout | undefined

/**
 * Start scheduler with regular update checks
 *
 * @param intervalInMin - Checking interval in minutes
 */
export function setupReleaseNotificationScheduler(intervalInMin: number = 60) {
	if (schedulerIntervalId !== undefined) {
		stopReleaseNotificationScheduler()
	}

	checkForUpdate()

	const MS_IN_MIN = 60 * 1000
	schedulerIntervalId = setInterval(() => {
		checkForUpdate()
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
