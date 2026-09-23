/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Migration } from '../migration.service.ts'

import { setAppConfig } from '../AppConfig.ts'

/**
 * Switch to the beta release channel when a beta build is installed,
 * so the choice is not lost after updating to an intermediate stable build.
 */
export const persistBetaReleaseChannelMigration: Migration = {
	name: 'Persist beta release channel',

	onFirstStart: true,

	onUpgrade: true,

	validator(): boolean {
		return __CHANNEL__ !== 'stable'
	},

	up() {
		setAppConfig('releaseChannel', 'beta')
	},
}
