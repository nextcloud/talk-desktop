/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/// <reference types="zx" />

const packageJson = require('../package.json')

$.quiet = true

/**
 * Exit with message and code
 *
 * @param {string} message - The error message
 * @param {number} code - The exit code
 */
function exit(message, code) {
	echo(message)
	process.exit(code)
}

/**
 * Show help
 */
function help() {
	echo`Prepare release packages for Talk Desktop

	Usage: npm run release:package -- --linux --mac --windows
	If no platform is specified, the current platform will be used.

	Args:
	--help - show help
	--channel [CHANNEL] - Release channel: stable, beta, or dev. Default is stable.
	--windows - build Windows package
	--linux - build Linux package
	--mac - build macOS package using universal architecture (recommended)
	--mac-x64 - build macOS package using x64 architecture
	--mac-arm64 - build macOS package using arm64 architecture
	--skip-install - skip installing dependencies in both repositories (use for debug only)
	--skip-check - skip checking for uncommitted changes in talk-desktop (use for debug only)
`
	exit('', 0)
}

/**
 * Prepare release packages for Talk Desktop
 *
 * @return {Promise<void>}
 */
async function prepareRelease() {
	const CHANNEL = process.env.CHANNEL || argv.channel || 'stable'

	// Default to the current platform
	if (!argv.windows && !argv.linux && !argv.mac && !argv['mac-x64'] && !argv['mac-arm64']) {
		const platform = process.platform === 'darwin' ? 'mac' : process.platform === 'win32' ? 'windows' : 'linux'
		argv[platform] = true
	}

	echo`Packaging Nextcloud Talk v${packageJson.version} ...`

	// Check Talk Desktop repository
	echo`[1/4] Checking for uncommitted changes in Talk Desktop${argv['skip-check'] ? ' (SKIPPED)' : '...'}`
	if (!argv['skip-check'] && (await $`git status -s`).stdout) {
		exit('❌ You have uncommitted changes in the Talk Desktop repository', 1)
	}

	// (Re)-install Talk dependencies
	if (!argv['skip-install']) {
		await spinner('[2/4] Installing dependencies ...', () => $`npm ci`)
	} else {
		echo`[2/4] Installing dependencies (SKIPPED)`
	}

	$.env.CHANNEL = CHANNEL

	// TODO: add Talk version extraction and logging

	// Styles override
	await spinner('[3/4] Overriding Nextcloud styles', async () => {
		const { overrideNextcloudStyles } = await import('./overrideNextcloudStyles.commands.mjs')
		await overrideNextcloudStyles({ verbose: true })
	})

	// Build and package
	echo`[4/4] Packaging...`
	argv.windows && await spinner('Package Windows', () => $`npm run build:windows && npm run package:windows`)
	argv.linux && await spinner('Package Linux', () => $`npm run build:linux && npm run package:linux`)
	argv.mac && await spinner('Package MacOS', () => $`npm run build:mac && npm run package:mac`)
	argv['mac-x64'] && await spinner('Package MacOS x64', () => $`npm run build:mac-x64 && npm run package:mac-x64`)
	argv['mac-arm64'] && await spinner('Package MacOS arm64', () => $`npm run build:mac-arm64 && npm run package:mac-arm64`)

	// Done
	echo`Done. See output in ./out/make/`
}

if (os.platform() === 'win32') {
	usePwsh()
}

if (argv.help) {
	help()
}

await prepareRelease()
