/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { computed } from 'vue'
import { browserStorage } from './browserStorage.service.ts'
import { useBrowserStorage } from './useBrowserStorage.ts'

/**
 * Control dev mode for additional debug tools
 */
export function useDevMode() {
	const isDevMode = __CHANNEL__ === 'dev'
		? useBrowserStorage(browserStorage, 'devMode', false)
		: computed({ get: () => false, set: () => {} })

	return {
		isDevMode,
	}
}
