/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { createApp } from 'vue'

let ocDialogsAdapter = null

document.addEventListener('TalkWebPageSetupDone', async () => {
	const { default: OcDialogsAdapter } = await import('./OcDialogsAdapter.vue')

	const container = document.body.appendChild(document.createElement('div'))

	ocDialogsAdapter = createApp(OcDialogsAdapter).mount(container)
})

export const dialogs = {
	YES_NO_BUTTONS: 70,
	OK_BUTTONS: 71,
	alert: (...args) => ocDialogsAdapter.alert(...args),
	confirm: (...args) => ocDialogsAdapter.confirm(...args),
	confirmDestructive: (...args) => ocDialogsAdapter.confirmDestructive(...args),
}
