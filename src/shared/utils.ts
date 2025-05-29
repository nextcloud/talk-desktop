/*
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export function once<F extends () => any>(func: F): F
export function once<F extends (...args: any[]) => void>(func: F): F
/**
 * Singletone function decorator
 *
 * @param func - Function
 */
export function once<F extends (() => any) | ((...args: any[]) => void)>(func: F): F {
	let wasCalled = false
	let result: ReturnType<F>

	return ((...args: Parameters<F>): ReturnType<F> => {
		if (!wasCalled) {
			wasCalled = true
			result = func(...args)
		}
		return result
	}) as F
}

/* eslint-enable @typescript-eslint/no-explicit-any */
