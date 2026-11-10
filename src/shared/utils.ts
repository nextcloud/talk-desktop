/*
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export function once<F extends () => any>(func: F): F
export function once<F extends (...args: any[]) => void>(func: F): F
/**
 * Singleton function decorator
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

/**
 * Singleton function decorator for async functions
 * to ensure a single concurrent function call during pending promise.
 *
 * @param func - Async function
 */
export function singletonPromise<T>(func: () => Promise<T>): () => Promise<T> {
	let promise: Promise<T> | undefined
	return () => {
		promise ??= func().finally(() => {
			promise = undefined
		})
		return promise
	}
}

/**
 * Resolve a promise after a specified time or on abort signal.
 * Same as node:timers/promises setTimeout but no throw on abort.
 *
 * @param ms - Milliseconds to wait
 * @param signal - Abort signal to cancel the wait
 * @return Promise resolving to true if waited the full time, false if aborted
 */
export function wait(ms: number, signal?: AbortSignal): Promise<boolean> {
	return new Promise<boolean>((resolve) => {
		// Already canceled
		if (signal?.aborted) {
			return resolve(false)
		}

		signal?.addEventListener('abort', onAbort, { once: true })

		const timeout = setTimeout(() => {
			signal?.removeEventListener('abort', onAbort)
			resolve(true)
		}, ms)

		/**
		 * Handle abort signal
		 */
		function onAbort() {
			clearTimeout(timeout)
			resolve(false)
		}
	})
}

/**
 * Create a repeatable wait function with a waking option
 *
 * @param ms - Milliseconds to wait
 * @param signal - Abort signal to stop waiting permanently
 */
export function createWaiter(ms: number, signal: AbortSignal) {
	let wakeController = new AbortController()

	return {
		/**
		 * Resolve a promise after the specified time
		 *
		 * @return false if the signal was aborted
		 */
		async wait() {
			await wait(ms, AbortSignal.any([signal, wakeController.signal]))
			// Restore if it was waked
			if (wakeController.signal.aborted) {
				wakeController = new AbortController()
			}
			return !signal.aborted
		},

		/**
		 * Fast-forward the current wait: currently running wait finishes immediately
		 */
		wake: () => wakeController.abort(),
	}
}

/**
 * Create a new URL object from a string but returning null instead of exception on invalid URL
 *
 * @param url - URL string
 * @param base - Base URL string
 * @return URL object or null if invalid
 */
export function createUrl(url: string, base?: string): URL | null {
	try {
		return new URL(url, base)
	} catch {
		return null
	}
}
