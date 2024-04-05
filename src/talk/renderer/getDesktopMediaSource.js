/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Vue from 'vue'

import AppGetDesktopMediaSource from './AppGetDesktopMediaSource.vue'

/** @type {import('vue').ComponentPublicInstance<AppGetDesktopMediaSource>} */
let appGetDesktopMediaSourceInstance

/**
 * Prompt user to select a desktop media source to share and return the selected sourceId or an empty string if canceled
 *
 * @param sources
 * @return {Promise<{ sourceId: string }>} sourceId of the selected mediaSource or an empty string if canceled
 */
export async function getDesktopMediaSource(sources) {
	if (!appGetDesktopMediaSourceInstance) {
		const container = document.body.appendChild(document.createElement('div'))
		const AppGetDesktopMediaSourceCreator = Vue.extend(AppGetDesktopMediaSource)
		appGetDesktopMediaSourceInstance = new AppGetDesktopMediaSourceCreator({ propsData: { sources } }).$mount(container)
	}

	return appGetDesktopMediaSourceInstance.promptDesktopMediaSource()
}
