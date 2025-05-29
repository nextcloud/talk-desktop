/*!
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Grant a permission requiring a user gesture:
 * Create a hidden button that will be clicked by the main process to request the permission.
 *
 * @param requester - Function to request the permission
 * @return - Promise that resolves with the result of the permission request
 */
export async function grantUserGesturedPermission<T>(requester: () => T) {
	return new Promise<T>((resolve) => {
		const id = `request-user-gestured-permission-${Math.random().toString(36).slice(2, 6)}`

		const button = document.createElement('button')
		document.body.appendChild(button)
		button.id = id
		button.className = 'visually-hidden'
		button.addEventListener('click', () => {
			const result = requester()
			button.remove()
			resolve(result)
		}, { once: true, passive: true })

		window.TALK_DESKTOP.grantUserGesturedPermission(id)
	})
}
