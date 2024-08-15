/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { t } from '@nextcloud/l10n'
import { createSettingsSectionElement } from './createSettingsSectionElement.ts'
import DesktopSettingsSection from './components/DesktopSettingsSection.vue'
import AccountsSettingsSection from './components/AccountsSettingsSection.vue'

/**
 * Register Talk Desktop settings sections
 */
export function registerTalkDesktopSettingsSection() {
	window.OCA.Talk.Settings.registerSection({
		id: 'talk-desktop-settings',
		name: t('talk_desktop', 'Application'),
		element: createSettingsSectionElement(DesktopSettingsSection).tagName,
	})

	window.OCA.Talk.Settings.registerSection({
		id: 'talk-desktop-accounts',
		name: t('talk_desktop', 'Accounts'),
		element: createSettingsSectionElement(AccountsSettingsSection).tagName,
	})
}
