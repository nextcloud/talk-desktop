/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export type ScreensharingSourceId = 'entire-desktop:0:0' | `${'screen' | 'window'}:${number}:${number}`

/**
 * The minimal description of a shared source, enough to tell which screens it captures.
 * Only plain data, as it is passed to the main process.
 */
export type SharedScreensharingSource = {
	id: ScreensharingSourceId
	/**
	 * ID of the display associated with a screen source, empty for a window source.
	 * Note: not provided by all the platforms.
	 */
	display_id: string
}

export type ScreensharingSource = SharedScreensharingSource & {
	name: string
	/**
	 * data:image/png;base64 encoded icon of the source
	 */
	icon: string | null
	/**
	 * data:image/png;base64 encoded thumbnail of the source
	 */
	thumbnail: string | null
}
