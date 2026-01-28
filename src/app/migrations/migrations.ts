/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Migration } from '../migration.service.ts'

import { clearFlatpakFontConfigCacheMigration } from './01-clearFlatpakFontConfigCache.migration.ts'

export const migrations: Migration[] = [
	clearFlatpakFontConfigCacheMigration,
]
