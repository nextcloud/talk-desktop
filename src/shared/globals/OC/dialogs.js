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

let ocDialogsAdapter = null

document.addEventListener('DOMContentLoaded', async () => {
	const { default: OcDialogsAdapter } = await import('./OcDialogsAdapter.vue')

	const container = document.body.appendChild(document.createElement('oc-dialog-wrapper'))

	ocDialogsAdapter = new Vue(OcDialogsAdapter).$mount(container)
})

export const dialogs = {
	YES_NO_BUTTONS: 70,
	OK_BUTTONS: 71,
	alert: (...args) => ocDialogsAdapter.alert(...args),
	confirm: (...args) => ocDialogsAdapter.confirm(...args),
	confirmDestructive: (...args) => ocDialogsAdapter.confirmDestructive(...args),
}
