/*!
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { t } from '@nextcloud/l10n'
import { appData } from '../../../app/AppData.js'
import { createURL } from '../../../shared/utils.ts'

/**
 * Parse URL string to get current server conversation token or error message if invalid
 * TODO: currently parsing error has messages for UI in the open conversation link dialog.
 * TODO: when it is needed in other places - return error code and translate on the component
 *
 * @param maybeConversationUrl - URL
 */
export function parseConversationToken(maybeConversationUrl: string): { token: string, error: string } {
	// No input - no output
	if (!maybeConversationUrl) {
		return { error: '', token: '' }
	}

	const url = createURL(maybeConversationUrl)
	if (!url) {
		return { error: t('talk_desktop', 'Invalid URL'), token: '' }
	}

	if (!maybeConversationUrl.startsWith(appData.serverUrl!)) {
		return { error: t('talk_desktop', 'Opening conversations from other servers is not currently supported'), token: '' }
	}

	let pathname = maybeConversationUrl.slice((appData.serverUrl as unknown as string).length)
	const indexPhp = pathname.indexOf('/index.php')
	if (indexPhp === 0) {
		pathname = pathname.slice('/index.php'.length)
	}

	const [isMatched, token] = pathname.match(/^\/call\/([a-z0-9]+)\/?$/i) ?? [false, '']
	if (!isMatched) {
		return { error: t('talk_desktop', 'Invalid URL'), token: '' }
	}

	return { token, error: '' }
}
