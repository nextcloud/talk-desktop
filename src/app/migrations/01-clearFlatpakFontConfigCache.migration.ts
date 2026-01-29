/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Migration } from '../migration.service.ts'

import { clearFlatpakFontConfigCache, isFlatpak } from '../system.utils.ts'

/**
 * Manually clear font config cache for Flatpak installations.
 * Fixes issues with font rendering like incorrect Emoji font.
 */
export const clearFlatpakFontConfigCacheMigration: Migration = {
	name: 'Clear flatpak font config cache',

	onFirstStart: true,

	validator(): boolean {
		// Flatpak specific problem
		return isFlatpak
	},

	async up() {
		await clearFlatpakFontConfigCache()
	},
}
