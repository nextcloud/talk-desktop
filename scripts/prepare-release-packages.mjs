/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/// <reference types="zx" />
/* eslint-disable no-undef */

const packageJson = require('../package.json')

const TALK_PATH = './out/.temp/spreed/'
const talkDotGit = `${TALK_PATH}.git`

$.quiet = true

/**
 * Exit with message and code
 * @param {string} message - The error message
 * @param {number} code - The exit code
 */
function exit(message, code) {
	echo(message)
	// eslint-disable-next-line n/no-process-exit
	process.exit(code)
}

/**
 * Show help
 */
function help() {
	echo`Prepare release packages for Talk Desktop with Talk in ${TALK_PATH}

	Usage: npm run release:package -- --linux --mac --windows --version=v20.0.0
	If no platform is specified, the current platform will be used.
	If no version is specified, the stable version from package.json will be used.

	Args:
	--help - show help
	--version - Optionally a specific Talk version/branch to build with, for example, v20.0.0-rc.1 or main. Default is package.json/talk.
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
 * Prepare release packages for Talk Desktop with Talk in TALK_PATH
 *
 * @return {Promise<void>}
 */
async function prepareRelease() {
	const CHANNEL = process.env.CHANNEL || argv.channel || 'stable'
	const TALK_VERSION = argv.version || packageJson.talk[CHANNEL]

	// Default to the current platform
	if (!argv.windows && !argv.linux && !argv.mac && !argv['mac-x64'] && !argv['mac-arm64']) {
		const platform = process.platform === 'darwin' ? 'mac' : process.platform === 'win32' ? 'windows' : 'linux'
		argv[platform] = true
	}

	echo`Packaging Nextcloud Talk v${packageJson.version} with Talk ${TALK_VERSION}...`

	// Git wrapper for Talk repository
	const gitSpreed = (command) => $`git --git-dir=${talkDotGit} --work-tree=${TALK_PATH} ${command}`

	// Check Talk Desktop repository
	echo`[1/5] Checking for uncommitted changes in Talk Desktop${argv['skip-check'] ? ' (SKIPPED)' : '...'}`
	if (!argv['skip-check'] && (await $`git status -s`).stdout) {
		exit('❌ You have uncommitted changes in the Talk Desktop repository', 1)
	}

	// Check and prepare Talk repository
	echo`[2/5] Checking for Talk repository in ${TALK_PATH}`
	if (fs.existsSync(TALK_PATH)) {
		echo`- Talk has been found in ${TALK_PATH}`
		echo`[3.1/5] Checking for uncommitted changes in Talk repository`
		if ((await gitSpreed(['status', '-s'])).stdout) {
			exit('❌ You have uncommitted changes in the Talk repository', 1)
		}
		echo`[3.2/5] Fetching Talk ${TALK_VERSION} from origin`
		await spinner(
			`Fetching Talk ${TALK_VERSION} from origin`,
			() => gitSpreed(['fetch', '--no-tags', '--depth=1', 'origin', 'tag', TALK_VERSION]),
		)
		echo`[3.3/5] Checkout Talk ${TALK_VERSION}`
		await spinner(
			`Checkout Talk ${TALK_VERSION}`,
			() => gitSpreed(['checkout', TALK_VERSION]),
		)
	} else {
		echo`- No Talk has been found in ${TALK_PATH}`
		echo`[3/5] Cloning Talk@${TALK_VERSION} to ${TALK_PATH}`
		await spinner(
			`Cloning Talk@${TALK_VERSION} to ${TALK_PATH}`,
			() => $`git clone --branch=${TALK_VERSION} --depth=1 -- https://github.com/nextcloud/spreed ${TALK_PATH}`,
		)
	}

	// (Re)-install Talk dependencies
	echo`[4/5] Installing dependencies${argv['skip-install'] ? ' (SKIPPED)' : '...'}`
	if (!argv['skip-install']) {
		await spinner(
			'[4.1/5] Installing dependencies in Talk Desktop',
			() => $`npm ci`,
		)

		await spinner(
			'[4.2/5] Installing dependencies in Talk',
			() => $`npm ci --prefix ${TALK_PATH}`,
		)
	}

	// Build and package
	echo`[5/5] Packaging...`
	$.env.TALK_PATH = TALK_PATH
	$.env.CHANNEL = CHANNEL
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
