/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Mark the window as ready to show
 */
export function markWindowReady() {
	// Wait for the next frame to ensure the window content is actually rendered
	requestAnimationFrame(() => {
		window.TALK_DESKTOP.markWindowReady()
	})
}
