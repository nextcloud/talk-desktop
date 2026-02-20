/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Argv } from 'mri'

import { app } from 'electron'
import { setAppConfig } from './AppConfig.ts'

/**
 * Handle CLI usage
 *
 * @param argv - Parsed by mri CLI arguments
 */
export async function cli(argv: Argv) {
	// TODO: Add --help command

	if (!argv._.length) {
		return
	}

	if (argv._[0] === 'config' && argv._.length === 1) {
		await handleConfigCommand(argv)
	} else {
		console.log('Unknown command:', argv._.join(' '))
		app.exit(1)
	}

	app.exit(0)
}

/**
 * Handle "config" CLI command
 *
 * @param argv - Parsed by mri CLI arguments
 */
async function handleConfigCommand(argv: Argv) {
	if (!argv.accounts) {
		console.log('No config to set')
		app.exit(1)
	}

	// --accounts=user@email.tld@server.tld/nextcloud,nextcloud.local
	const accounts = argv.accounts.split(',')

	// Validate
	for (const account of accounts) {
		const atIndex = account.lastIndexOf('@')
		const [server, user] = atIndex === -1
			? [account, '']
			: [account.slice(atIndex + 1), account.slice(0, atIndex)]
		try {
			new URL(`https://${server}`)
		} catch {
			console.error(`Invalid server: ${server}`)
			app.exit(1)
		}
		if (user && (!/^[a-zA-Z0-9 _.@\-']{1,64}$/.test(user) || user !== user.trim())) {
			console.error(`Invalid user: ${user}`)
			app.exit(1)
		}
	}

	// Set
	await setAppConfig('accounts', accounts)

	console.log('Accounts configuration updated')
}
