/*
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// See: https://wicg.github.io/idle-detection/#api-idledetector

type UserIdleState = 'active' | 'idle'

type ScreenIdleState = 'locked' | 'unlocked'

type IdleOptions = {
	/**
	 * Min 60_000 ms
	 */
	threshold?: number
	signal?: AbortSignal
}

interface IdleDetector extends EventTarget {
	userState: UserIdleState | null
	screenState: ScreenIdleState | null

	start(options?: IdleOptions): Promise<void>
	onchange(callback: () => void): void
}

interface IdleDetectorConstructor {
	requestPermission(): Promise<PermissionState>

	new (): IdleDetector
	prototype: IdleDetector
}

declare const IdleDetector: IdleDetectorConstructor
