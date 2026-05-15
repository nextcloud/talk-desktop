/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { resolve } from 'node:path'
import { argv, echo } from 'zx'
import { getNextcloudVersionForTalk, resolveBuildConfig } from '../build/resolveBuildConfig.js'
import { extractNextcloudStyles } from './nextcloud-app-host/extractNextcloudStyles.mjs'

if (argv.help) {
	echo`Override Nextcloud styles with the current build config

	Usage:
	  node scripts/override-nextcloud-styles.mjs [options]

	Arguments:
		--version <nextcloud-version-major> - major version of Nextcloud to override styles for (e.g. "34"), default: the current built-in Talk's Nextcloud version
		--help - show help
		--port <number> - port to expose the Nextcloud server on, default: 6123
		--keep - keep the Docker container after styles extraction (useful for debugging and multiple runs)
		--verbose - show verbose output

	Example:
	  node scripts/override-nextcloud-styles.mjs
	  node scripts/override-nextcloud-styles.mjs --version 34
`
	process.exit(0)
}

const BUILD_CONFIG = resolveBuildConfig()

if (!BUILD_CONFIG.withThemingOverrides) {
	echo('Theming override is not needed for the current build config')
	process.exit(0)
}

const version = argv.version || getNextcloudVersionForTalk()

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
	port: argv.port,
	keep: !!argv.keep,
	verbose: !!argv.verbose,
})
