/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { resolve } from 'node:path'
import { echo } from 'zx'
import { getNextcloudVersionForTalk, resolveBuildConfig } from '../build/resolveBuildConfig.js'
import { extractNextcloudStyles } from './nextcloud-app-host/extractNextcloudStyles.mjs'

/**
 * Override Nextcloud styles with the current build config, if needed
 *
 * @param {object} options - Options
 * @param {string} options.version - Nextcloud major version (e.g. "34")
 * @param {boolean} options.keep - Whether to keep the Docker container after styles extraction
 * @param {boolean} options.verbose - Whether to show verbose output
 */
export async function overrideNextcloudStyles({ version = getNextcloudVersionForTalk(), keep = false, verbose = false } = {}) {
	const BUILD_CONFIG = resolveBuildConfig()

	if (!BUILD_CONFIG.withThemingOverrides) {
		echo('Theming override is not needed for the current build config')
		process.exit(0)
	}

	const meta = await import(`../resources/server-global-styles/${version}/meta.js`)

	await extractNextcloudStyles({
		dest: resolve(import.meta.dirname, '../.overrides/styles'),
		[meta.versionRefType]: meta.versionRef,
		themingConfigs: [
			{
				name: '',
				primaryColor: BUILD_CONFIG.primaryColor,
				backgroundColor: BUILD_CONFIG.backgroundColor,
			},
		],
		keep,
		verbose,
	})
}
