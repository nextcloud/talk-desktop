/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { argv, echo } from 'zx'
import { overrideNextcloudStyles } from './overrideNextcloudStyles.commands.mjs'

if (argv.help) {
	echo`Override Nextcloud styles with the current build config

	Usage:
	  node scripts/override-nextcloud-styles.mjs [options]

	Arguments:
		--version <nextcloud-version-major> - major version of Nextcloud to override styles for (e.g. "34"), default: the current built-in Talk's Nextcloud version
		--help - show help
		--keep - keep the Docker container after styles extraction (useful for debugging and multiple runs)
		--verbose - show verbose output

	Example:
	  node scripts/override-nextcloud-styles.mjs
	  node scripts/override-nextcloud-styles.mjs --version 34
`
	process.exit(0)
}

await overrideNextcloudStyles({
	version: argv.version,
	keep: argv.keep,
	verbose: argv.verbose,
})
