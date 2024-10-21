/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Ref, WritableComputedRef } from 'vue'
import { computed } from 'vue'

export type NcSelectOption<T> = { label: string, value: T }

/**
 * Create a model proxy for NcSelect
 * @param modelValue - the model value to bind to
 * @param options - the list of the select options
 * @return - a model proxy for NcSelect
 */
export function useNcSelectModel<T>(modelValue: Ref<T>, options: NcSelectOption<T>[]): WritableComputedRef<NcSelectOption<T>> {
	return computed({
		get() {
			return options.find(item => item.value === modelValue.value)!
		},

		set(option: NcSelectOption<T>) {
			modelValue.value = option.value
		},
	})
}
