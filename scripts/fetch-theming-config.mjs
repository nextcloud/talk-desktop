/*!
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Get theming colors from a Nextcloud server for build config
 *
 * # Get theming from the current custom config server URL
 * $ CUSTOM_CONFIG=<custom.config.json> node scripts/fetch-theming-config.mjs
 *
 * # Get theming config from a specific server URL
 * $ node scripts/fetch-theming-config.mjs <server-url>
 */

import { resolveConfig } from '../build/resolveBuildConfig.js'

const url = process.argv[2] ?? (await resolveConfig()).domain
console.log(`Fetching theming config from: ${url}`)

const response = await fetch(url + '/ocs/v2.php/cloud/capabilities', { headers: { Accept: 'application/json', 'OCS-APIRequest': 'true' } }).then((response) => response.json())

console.log(JSON.stringify({
	primaryColor: response.ocs.data.capabilities.theming.color,
	backgroundColor: response.ocs.data.capabilities.theming.background, // Note: capabilities don't return background color is an image is set
}, null, 2))
