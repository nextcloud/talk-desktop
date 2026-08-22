/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export type ScreensharingSourceId = 'entire-desktop:0:0' | `${'screen' | 'window'}:${number}:${number}`

export type ScreensharingSource = {
	id: ScreensharingSourceId
	name: string
	/**
	 * data:image/png;base64 encoded icon of the source
	 */
	icon: string | null
	/**
	 * data:image/png;base64 encoded thumbnail of the source
	 */
	thumbnail: string | null
	/**
	 * Whether the source is a minimized window (Windows only).
	 * Minimized windows produce no frames until restored, so they have no live preview
	 * and must be restored via activateWindowForCapture() before capturing.
	 */
	minimized?: boolean
}
