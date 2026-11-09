/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import os from 'node:os'
import { osTitle } from '../app/system.utils.ts'
import { BUILD_CONFIG } from '../shared/build.config.ts'

export type Credentials = {
	/** Server URL */
	server: string
	/** User's Login (user@example.com, not userid) */
	user: string
	/** App password */
	password: string
}

/**
 * Get the device name for login flows user agent.
 * Login flow has no specifications on the device name format.
 * The agreement is to use "<hostname> (<client> - <OS>)"
 *
 * @example "host_username (Nextcloud Talk - Windows)"
 * @example "host_username (Branded Talk - Linux)"
 */
export function getLoginFlowDeviceName() {
	return `${os.hostname()} (${BUILD_CONFIG.applicationName} - ${osTitle})`
}
