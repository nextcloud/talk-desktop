/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Migration } from '../migration.service.ts'

import { clearFlatpakFontConfigCacheMigration } from './01-clearFlatpakFontConfigCache.migration.ts'
import { persistBetaReleaseChannelMigration } from './02-persistBetaReleaseChannel.migration.ts'
import { reapplyLaunchAtStartupMigration } from './03-reapplyLaunchAtStartup.migration.ts'

export const migrations: Migration[] = [
	clearFlatpakFontConfigCacheMigration,
	persistBetaReleaseChannelMigration,
	reapplyLaunchAtStartupMigration,
]
