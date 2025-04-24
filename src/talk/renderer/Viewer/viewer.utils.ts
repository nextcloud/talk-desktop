/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { davRemoteURL, davRootPath } from '@nextcloud/files'
import { generateUrl } from '@nextcloud/router'

/**
 * Generate an absolute WebDAV URL to a user's file
 *
 * @param filename - Path to user's file, e.g. '/Talk/file.txt'
 * @return Full path to the file, e.g. 'https://nextcloud.ltd/remote.php/dav/files/username/Talk/file.txt'
 */
export function generateUserFileDavUrl(filename: string): string {
	return davRemoteURL + davRootPath + filename
}

/**
 * Generate an absolute URL for a Nextcloud file preview
 *
 * @param fileId - the fileid
 * @param etag - the ETag
 */
export function generateFilePreviewUrl(fileId: string, etag: string): string {
	const searchParams = new URLSearchParams(Object.entries({
		fileId,
		x: Math.floor(window.screen.width * window.devicePixelRatio).toString(),
		y: Math.floor(window.screen.height * window.devicePixelRatio).toString(),
		a: 'true',
		etag,
	})).toString()

	return generateUrl(`/core/preview?${searchParams}`)
}
