/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { FileStat } from 'webdav'

import { davGetClient, davRemoteURL, davRootPath } from '@nextcloud/files'

export async function fetchFileContent(filename: string, format: 'text'): Promise<string>
export async function fetchFileContent(filename: string, format: 'binary'): Promise<Blob>
/**
 * Fetch file content
 *
 * @param filename - Path to user's file, e.g. '/Talk/file.txt'
 * @param format - Format of the file content to be returned. 'binary' is returned as Blob
 */
export async function fetchFileContent(filename: string, format: 'text' | 'binary'): Promise<string | Blob> {
	const webDavClient = davGetClient(davRemoteURL + davRootPath)

	if (format === 'text') {
		// Get the text file content
		return await webDavClient.getFileContents(filename, { format }) as string
	}

	// Get the MIME type of the file for the binary file to generate a correct Blob later
	const stat = await webDavClient.stat(filename) as FileStat
	const mimeType = stat.mime
	// Get the file content as ArrayBuffer and convert it to Blob
	const content = await webDavClient.getFileContents(filename, { format }) as ArrayBuffer
	return new Blob([content], { type: mimeType })
}
