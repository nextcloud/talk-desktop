/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { IFile } from '@nextcloud/files'

import axios from '@nextcloud/axios'

type FileContentByType = {
	text: string
	blob: Blob
}

/**
 * Fetch file content
 *
 * @param file - File to fetch
 * @param type - File content type
 */
export async function getFileContent<T extends keyof FileContentByType>(file: IFile, type: T): Promise<FileContentByType[T]> {
	const { data } = await axios.get<FileContentByType[T]>(file.source, { responseType: type })
	return data
}
