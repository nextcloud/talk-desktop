/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { AppConfig, AppConfigKey } from '../../../app/AppConfig.ts'

import { computed } from 'vue'
import { useAppConfigStore } from './appConfig.store.ts'

/**
 * Get an application config value
 *
 * @param key - The key of the config value
 * @return A settable config value
 */
export function useAppConfigValue<K extends AppConfigKey>(key: K) {
	const { getAppConfigValue, setAppConfigValue } = useAppConfigStore()

	return computed({
		get() {
			return getAppConfigValue(key)
		},
		set(value: AppConfig[K]) {
			setAppConfigValue(key, value)
		},
	})
}
