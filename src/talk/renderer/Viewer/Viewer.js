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
	Viewer.instance = new Vue(ViewerApp).$mount(container)

	return Viewer
}
