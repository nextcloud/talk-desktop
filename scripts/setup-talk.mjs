/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { mkdirSync, rmSync, symlinkSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { argv, question } from 'zx'

const talkOverridePath = resolve(import.meta.dirname, '../.overrides/spreed')

const commands = {
	help,
	clone,
	link,
	reset,
}

const command = argv._[0]

if (command in commands) {
	commands[command]()
} else {
	console.error(`Unknown command: ${command}`)
	process.exit(1)
}

/**
 * Help
 */
function help() {
	console.log(`Usage: node setup-talk.mjs <command> [args] [options]

Commands:
  help                     Show help
  clone [branch]           Clone the spreed repository into the .overrides/spreed directory (default branch: main) and install dependencies
  link <path_to_spreed>    Create a symlink from the .overrides/spreed/ directory to the specified path
  reset                    Remove .overrides/spreed

Options:
  --verbose                Show verbose output
`)
}

/**
 * Clone the spreed repository into the .overrides/spreed directory and install dependencies
 *
 * @param {string} branch - Branch to clone (default: main)
 */
async function clone(branch = 'main') {
	await $`git clone https://github.com/nextcloud/spreed ${talkOverridePath} --branch ${branch} --filter=blob:none`
	await $`npm ci --prefix ${talkOverridePath}`
}

/**
 * Create a symlink from the .overrides/spreed/ directory to the specified path
 */
function link() {
	const target = resolve(process.env.INIT_CWD ?? '', argv._[1])
	if (!target) {
		console.error('Usage: node setup-talk.mjs link <path_to_spreed>')
		process.exit(1)
	}

	mkdirSync(dirname(talkOverridePath), { recursive: true })
	rmSync(talkOverridePath, { force: true })
	symlinkSync(target, talkOverridePath, 'junction')
}

/**
 * Remove .overrides/spreed
 */
async function reset() {
	if (argv.y || argv.yes || await question('Are you sure you want to delete .overrides/spreed/? Data can be lost. (y/N)') === 'y') {
		rmSync(talkOverridePath, { force: true })
	}
}
