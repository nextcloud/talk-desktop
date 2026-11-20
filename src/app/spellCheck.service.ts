/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { session } from 'electron'
import { onAppConfigChange } from './AppConfig.ts'

onAppConfigChange('enableSpellCheck', (value) => {
	session.defaultSession.setSpellCheckerEnabled(value)
})

onAppConfigChange('spellCheckLanguages', (value) => {
	session.defaultSession.setSpellCheckerLanguages(value)
})
