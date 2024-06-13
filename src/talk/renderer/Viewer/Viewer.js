/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { createApp } from 'vue'
import ViewerApp from './ViewerApp.vue'
import ViewerHandlerImages from './ViewerHandlerImages.vue'
import ViewerHandlerVideos from './ViewerHandlerVideos.vue'

/**
 * Create and mount Viewer instance with similar to original OCA.Viewer interface
 * @return {object}
 */
export function createViewer() {
	const Viewer = {
		availableHandlers: [{
			id: 'images',
			group: 'media',
			mimes: [
				'image/apng',
				'image/bmp',
				'image/gif',
				'image/jpeg',
				'image/png',
				'image/svg+xml',
				'image/webp',
				'image/x-icon',
				'image/x-xbitmap',
			],
			component: ViewerHandlerImages,
		}, {
			id: 'videos',
			group: 'media',
			mimes: [
				'video/mpeg',
				'video/ogg',
				'video/webm',
				'video/mp4',
				'video/x-m4v',
				'video/x-flv',
				'video/quicktime',
				'video/x-matroska',
			],
			component: ViewerHandlerVideos,
		}],

		open(...args) {
			Viewer.instance.open(...args)
		},

		close() {
			Viewer.instance.close()
		},

		instance: null,
	}

	const container = document.body.appendChild(document.createElement('div'))
	Viewer.instance = createApp(ViewerApp).mount(container)

	return Viewer
}
