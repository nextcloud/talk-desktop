/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { createUrl } from './utils.ts'

export type AccountId = {
	accountId: string
	serverUrl: string
	userId?: string
}

/**
 * Normalize server URL by removing protocol, trailing slash and optional /index.php
 *
 * @param serverUrl - Server URL string, e.g. https://company.tld:4433/nextcloud/index.php?what
 * @return Normalized server URL string, e.g. company.tld:4433/nextcloud or null if invalid or http://
 */
export function normalizeServerUrl(serverUrl?: string): string | null {
	if (!serverUrl) {
		return null
	}

	if (serverUrl.startsWith('http://')) {
		return null
	}

	const url = createUrl(serverUrl.startsWith('https://') ? serverUrl : `https://${serverUrl}`)
	if (!url) {
		return null
	}

	const pathname = url.pathname
		// Remove optional trailing /index.php
		.replace(/\/index\.php$/, '')
		// Remove trailing slash
		.replace(/\/$/, '')

	return url.host + pathname
}

/**
 * Validate userid format according to OC\User\Manager::validateUserId
 *
 * @see https://github.com/nextcloud/server/blob/v34.0.0/lib/private/User/Manager.php#L717
 * @param userId - User Id string
 * @return Whether the userId is in a valid format
 */
export function isValidUserId(userId: string): boolean {
	return /^[a-zA-Z0-9 _.@\-']{1,64}$/.test(userId)
		&& userId === userId.trim()
		&& userId !== '.'
		&& userId !== '..'
}

/**
 * Build accountId from serverUrl and optional userid
 *
 * @param serverUrl - Normalized server URL string
 * @param userId - UserId
 */
export function buildAccountId(serverUrl: string, userId?: string): string {
	return userId ? `${userId}@${serverUrl}` : serverUrl
}

/**
 * Parse accountId into normalized serverUrl, optional userId
 *
 * @param accountId - Account Id string in the format of {user}@{server} or {server}
 */
export function parseAccountId(accountId?: string) {
	if (!accountId) {
		return null
	}

	const atIndex = accountId.lastIndexOf('@')
	const serverUrl = normalizeServerUrl(accountId.slice(atIndex + 1))
	const userId = atIndex !== -1 ? accountId.slice(0, atIndex) : undefined

	if (!serverUrl) {
		return null
	}

	if (userId !== undefined && !isValidUserId(userId)) {
		return null
	}

	return {
		accountId: buildAccountId(serverUrl, userId),
		serverUrl,
		userId,
	}
}
