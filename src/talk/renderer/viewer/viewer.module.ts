/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { registerDefaultHandlers } from '@nextcloud/viewer'

/**
 * Register default and additional viewer handlers:
 * - Default viewer handlers provided by `@nextcloud/viewer`
 * - PDF viewer
 * - Text (.txt, .md, code) viewer
 */
export function registerViewerHandlers() {
	registerDefaultHandlers()
}
