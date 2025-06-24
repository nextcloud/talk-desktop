/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { t } from '@nextcloud/l10n'
import DesktopSettingsSection from './DesktopSettingsSection.vue'
import { createCustomElement } from '../utils/createCustomElement.ts'

/**
 * Register Talk Desktop settings sections
 */
export function registerTalkDesktopSettingsSection() {
	window.OCA.Talk.Settings.registerSection({
		id: 'talk-desktop-settings-application',
		name: t('talk_desktop', 'Application'),
		element: createCustomElement('talk-desktop-settings-application', DesktopSettingsSection),
	})
}
