/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { argv, echo } from 'zx'
import { extractNextcloudStyles } from './nextcloud-app-host/extractNextcloudStyles.mjs'

if (argv.help || !argv._.length) {
	echo`Extract Nextcloud styles including theming

	Usage:
		node scripts/extract-nextcloud-styles.mjs <dest> [options]

	Arguments:
		<dest> - destination directory for the extracted styles
		--help - show help
		--branch <branch> - nextcloud/server branch to extract styles from, default: "master"
		--tag <tag> - nextcloud/server version tag to extract styles from
		--theming - theming configurations to extract themes in a format of "name:primaryColor:backgroundColor,name:primaryColor:backgroundColor", default "::" (the default theme)
		--keep - keep the Docker container after styles extraction (useful for debugging and multiple runs)
		--verbose - show verbose output

	Examples:
		node scripts/extract-nextcloud-styles.mjs ./resources/server-global-styles
		node scripts/extract-nextcloud-styles.mjs ./resources/server-global-styles --branch master
		node scripts/extract-nextcloud-styles.mjs ./resources/server-global-styles --tag v32.0.3
		node scripts/extract-nextcloud-styles.mjs ./resources/server-global-styles --theming "red"
`
	process.exit(0)
}

await extractNextcloudStyles({
	dest: argv._[0],
	branch: argv.branch,
	tag: argv.tag,
	themingConfigs: (argv.theming ?? '::')
		.split(',')
		.map((theme) => theme.split(':'))
		.map(([name, primaryColor, backgroundColor]) => ({ name, primaryColor, backgroundColor })),
	port: argv.port,
	keep: !!argv.keep,
	verbose: !!argv.verbose,
})
