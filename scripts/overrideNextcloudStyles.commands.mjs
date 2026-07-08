/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { resolve } from 'node:path'
import { chalk, echo } from 'zx'
import { getNextcloudStyles, getNextcloudVersionForTalk, resolveBuildConfig } from '../build/resolveBuildConfig.js'
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
	const styles = getNextcloudStyles(version)

	if (!styles.overridesRequired) {
		echo(chalk.gray('No styles overrides required: build config does not modify the default theming configurations'))
		return
	}

	if (styles.overridesUpToDate) {
		echo(chalk.gray('No styles overrides required: already up-to-date'))
		return
	}

	await extractNextcloudStyles({
		dest: resolve(import.meta.dirname, '../.overrides/styles'),
		[styles.base.meta.versionRefType]: styles.base.meta.versionRef,
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
