/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { browserStorage } from './browserStorage.service.ts'
import { useBrowserStorage } from './useBrowserStorage.ts'

/**
 * Control dev mode for additional debug tools
 */
export function useDevMode() {
	const isDevMode = useBrowserStorage(browserStorage, 'devMode', false)

	return {
		isDevMode,
	}
}
