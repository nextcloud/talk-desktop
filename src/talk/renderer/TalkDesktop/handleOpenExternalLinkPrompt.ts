/*!
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { spawnDialog } from '@nextcloud/vue/functions/dialog'
import OpenExternalLinkDialog from './OpenExternalLinkDialog.vue'

/**
 * Handle openExternalLink prompts by showing a confirmation dialog
 */
export async function handleOpenExternalLinkPrompt() {
	window.TALK_DESKTOP.onOpenExternalLinkPrompt(async (_: unknown, { url, requestUUID }: { url: string, requestUUID: string }) => {
		window.TALK_DESKTOP.resolveOpenExternalLinkPrompt(requestUUID, await spawnDialog(OpenExternalLinkDialog, { url }))
	})
}
