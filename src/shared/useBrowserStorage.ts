/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { getBuilder } from '@nextcloud/browser-storage'

import { useEventListener } from '@vueuse/core'
import { computed, shallowRef } from 'vue'

// TODO: Expose types from the library
type NextcloudStorage = ReturnType<ReturnType<typeof getBuilder>['build']>

/**
 * Create a reactive variable that is stored in the @nextcloud/browser-storage instance and is synced
 *
 * @param browserStorage - @nextcloud/browser-storage instance
 * @param key - Key to store the value
 * @param defaultValue - Default value
 */
export function useBrowserStorage<T extends unknown | null>(browserStorage: NextcloudStorage, key: string, defaultValue: T | null = null) {
	const parse = (value: string | null) => value ? JSON.parse(value) as T : null

	const _data = shallowRef<T | null>(parse(browserStorage.getItem(key)) ?? defaultValue)

	const data = computed<T | null>({
		get: () => _data.value,
		set: (value: T | null) => {
			_data.value = value
			if (value === null) {
				browserStorage.removeItem(key)
			} else {
				browserStorage.setItem(key, JSON.stringify(value))
			}
		},
	})

	useEventListener(window, 'storage', (event) => {
		// TODO: expose scopeKey
		const scopedKey = 'scopeKey' in browserStorage && typeof browserStorage.scopeKey === 'function' ? browserStorage.scopeKey(key) : key
		if (event.key !== scopedKey) {
			return
		}
		_data.value = parse(event.newValue)
	})

	return data
}
