/*
 * @copyright Copyright (c) 2024 Grigorii Shartsev <me@shgk.me>
 *
 * @author Grigorii Shartsev <me@shgk.me>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import Vue from 'vue'

import AppGetDesktopMediaSource from './AppGetDesktopMediaSource.vue'

/** @type {import('vue').ComponentPublicInstance<AppGetDesktopMediaSource>} */
let appGetDesktopMediaSourceInstance

/**
 * Prompt user to select a desktop media source to share and return the selected sourceId or an empty string if canceled
 *
 * @return {Promise<{ sourceId: string }>} sourceId of the selected mediaSource or an empty string if canceled
 */
export async function getDesktopMediaSource() {
	if (!appGetDesktopMediaSourceInstance) {
		const container = document.body.appendChild(document.createElement('div'))
		appGetDesktopMediaSourceInstance = new Vue(AppGetDesktopMediaSource).$mount(container)
	}

	return appGetDesktopMediaSourceInstance.promptDesktopMediaSource()
}
