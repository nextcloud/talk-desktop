/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Migration } from '../migration.service.ts'

import { getAppConfig, setAppConfig } from '../AppConfig.ts'
import { setLaunchAtStartup } from '../launchAtStartup.config.ts'
import { isLinux } from '../system.utils.ts'

/**
 * Re-apply launch at startup config after design changes
 * - New path on Windows/MSI from https://github.com/nextcloud/talk-desktop/pull/2042
 * - Switching to "enabled" (approval) toggle on Windows from https://github.com/nextcloud/talk-desktop/pull/2043
 * - Switching from internal app config to reflecting system config from https://github.com/nextcloud/talk-desktop/pull/2044
 * (assuming that the current internal app config reflects the previous user choice)
 */
export const reapplyLaunchAtStartupMigration: Migration = {
	name: 'Re-apply launch at startup',
	onUpgrade: true,
	validator() {
		// There is no launch at startup option on Linux
		return !isLinux
	},
	up() {
		// @ts-expect-error: launchAtStartup does not exist in the AppConfig anymore and is read only to get the non-migrated value
		const launchAtStartup = getAppConfig('launchAtStartup')
		if (launchAtStartup) {
			setLaunchAtStartup(true)
		}

		// Remove unused config
		// @ts-expect-error: launchAtStartup does not exist in the AppConfig anymore and is now being removed
		setAppConfig('launchAtStartup', undefined)
	},
}
