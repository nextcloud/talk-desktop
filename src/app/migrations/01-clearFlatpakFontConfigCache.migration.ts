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

	// Electron is already initializing at this point and there is no simple way to start it later
	// Changing font config is too late
	// App relaunch is required to take effect
	requiresRelaunch: true,

	validator(): boolean {
		// Flatpak specific problem
		return isFlatpak
	},

	async up() {
		await clearFlatpakFontConfigCache()
	},
}
