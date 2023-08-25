/*
 * @copyright Copyright (c) 2023 Grigorii Shartsev <me@shgk.me>
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
import ViewerApp from './Viewer/ViewerApp.vue'

export const Viewer = {
	availableHandlers: [{
		id: 'images',
		group: 'media',
		mimes: [
			'image/apng',
			'image/bmp',
			// 'image/gif',
			'image/jpeg',
			'image/png',
			// 'image/svg+xml',
			'image/webp',
			'image/x-icon',
			'image/x-xbitmap',
		],
		component: 'ViewerHandlerImage',
	}],

	async open({ path, list, onClose = () => undefined } = {}) {
		if (!Viewer._viewer) {
			await Viewer.mount()
		}

		Viewer._viewer.open({ path, list, onClose })
	},

	close() {
		if (!Viewer._viewer) {
			return
		}
		Viewer._viewer.close()
	},

	mount() {
		const container = document.createElement('div')
		container.id = 'viewer'
		document.body.appendChild(container)

		Viewer._viewer = new Vue(ViewerApp).$mount(container)
	},

	_isMounted: false,
	_viewer: null,
}
