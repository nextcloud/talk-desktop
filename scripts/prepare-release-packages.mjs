/*
 * @copyright Copyright (c) 2023 Grigorii Shartsev <me@shgk.me>
 *
 * @author Grigorii Shartsev <me@shgk.me>
 *
 * @license AGPL-3.0-or-later
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

import { $, echo, spinner, argv, fs, quotePowerShell, os, which } from 'zx'

function exit(message, code) {
	echo(message)
	process.exit(code)
}

/**
 * Show help
 */
function help() {
	echo`Prepare release packages for Talk Desktop with Talk in ./spreed/.

	Usage: npm run release:package -- --version=v17.0.0 --linux --mac --windows

	Args:
	--help - show help
	--version - Talk version to be build-in in the release, for example, v17.0.0-rc.1 or master
	--windows - build Windows package
	--linux - build Linux package
	--mac - build macOS package
	--skip-install - skip npm ci in both repositories
`
	exit('', 0)
}

/**
 * Prepare release packages for Talk Desktop with Talk in ./spreed/
 *
 * @return {Promise<void>}
 */
async function prepareRelease() {
	// Validate arguments
	const version = argv.version
	if (!version) {
		exit(`❌ You must specify --version`, 1)
	}
	if (!argv.windows && !argv.linux && !argv.mac) {
		exit('❌ You must specify at least one of --windows, --linux or --mac', 1)
	}

	// Git wrapper for Talk repository
	const gitSpreed = (command) => $`git --git-dir=./spreed/.git --work-tree=./spreed ${command}`

	// Check Talk Desktop repository
	echo`[1/5] Check for uncommitted changes in Talk Desktop`
	if ((await $`git status -s`.quiet()).stdout) {
		exit(`❌ You have uncommitted changes in the Talk Desktop repository`, 1)
	}

	// Check and prepare Talk repository
	echo`[2/5] Check for Talk repository in ./spreed/`
	if (fs.existsSync('./spreed/')) {
		echo`- Talk has been found in ./spreed/`
		echo`[3.1/5] Check for uncommitted changes in Talk repository`
		if ((await gitSpreed(['status', '-s']).quiet()).stdout) {
			exit(`❌ You have uncommitted changes in the Talk repository`, 1)
		}
		echo`[3.2/5] Checkout Talk ${version}`
		await spinner(
			`Checkout Talk ${version}`,
			() => gitSpreed(['checkout', version])
		)
	} else {
		echo`- No Talk has been found in ./spreed/`
		echo`[3/5] Clone Talk@${version} to ./spreed/`
		await spinner(
			`Cloning Talk@${version} to ./spreed/`,
			() => $`git clone --branch=${version} --depth=1 -- https://github.com/nextcloud/spreed spreed`
		)
	}

	// (Re)-install Talk dependencies
	if (!argv['skip-install']) {
		echo`[4/5] Install dependencies`
		await spinner(
			'Installing dependencies in Talk Desktop',
			() => $`npm ci`
		)

		await spinner(
			'Installing dependencies in Talk',
			() => $`npm ci --prefix ./spreed`
		)
	} else {
		echo`SKIPPED [5/5] Install dependencies`
	}

	// Package with Talk from ./spreed/
	echo`[5/5] Package with Talk from ./spreed/`
	$.env.TALK_PATH = 'spreed'
	argv.windows && await spinner('Package Windows', () => $`npm run package:windows && npm run make:windows`)
	argv.linux && await spinner('Package Linux', () => $`npm run package:linux && npm run make:linux`)
	argv.mac && await spinner('Package MacOS', () => $`npm run package:mac && npm run make:mac`)

	// Done
	echo`Done. See output in ./out/make/`
}

// Hotfix for Windows when WSL Bash is used instead of pwsh
if (os.platform() === 'win32') {
	$.shell = which.sync('pwsh.exe')
	$.quote = quotePowerShell
	$.prefix = ''
}

if (argv.help) {
	help()
}

await prepareRelease()
