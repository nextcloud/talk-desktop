/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Vue from 'vue'
import AppGetDesktopMediaSource from './AppGetDesktopMediaSource.vue'

let appGetDesktopMediaSourceInstance: InstanceType<typeof AppGetDesktopMediaSource> | null = null

/**
 * Prompt user to select a desktop media source to share and return the selected sourceId or an empty string if canceled
 *
 * @return sourceId of the selected mediaSource or an empty string if canceled
 */
export async function getDesktopMediaSource() {
	if (!appGetDesktopMediaSourceInstance) {
		const container = document.body.appendChild(document.createElement('div'))
		appGetDesktopMediaSourceInstance = new Vue(AppGetDesktopMediaSource).$mount(container) as InstanceType<typeof AppGetDesktopMediaSource>
	}

	return appGetDesktopMediaSourceInstance.promptDesktopMediaSource()
}
