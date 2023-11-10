<!--
  - @copyright Copyright (c) 2023 Grigorii Shartsev <me@shgk.me>
  -
  - @author Grigorii Shartsev <me@shgk.me>
  -
  - @license AGPL-3.0-or-later
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -->

<template>
	<div>
		<NcDialog v-for="dialog in dialogs"
			:key="dialog.id"
			:name="dialog.name"
			:message="dialog.message"
			:buttons="dialog.buttons"
			@update:open="deleteDialog(dialog.id)" />
	</div>
</template>

<script>
import { translate as t } from '@nextcloud/l10n'
import NcDialog from '@nextcloud/vue/dist/Components/NcDialog.js'

const Buttons = {
	OK_BUTTONS: (callback) => [
		{
			label: t('talk_desktop', 'Ok'),
			callback: () => callback(),
		},
	],
	YES_NO_BUTTONS: (callback) => [
		{
			label: t('talk_desktop', 'No'),
			callback: () => callback(false),
		},
		{
			label: t('talk_desktop', 'Yes'),
			type: 'primary',
			callback: () => callback(true),
		},
	],
}

// Maps server Dialogs constants to Buttons
const OcDialogButtonsENUM = {
	70: 'YES_NO_BUTTONS',
	71: 'OK_BUTTONS',
}

export default {
	name: 'OcDialogsAdapter',

	expose: ['info', 'alert', 'confirm', 'confirmDestructive', 'prompt'],

	components: {
		NcDialog,
	},

	data() {
		return {
			dialogs: {},
		}
	},

	methods: {
		addDialog(dialogProps) {
			const id = Math.random().toString(36).slice(2, 7)
			this.$set(this.dialogs, id, {
				id,
				...dialogProps,
			})
		},

		deleteDialog(id) {
			this.$delete(this.dialogs, id)
		},

		/**
		 * displays info dialog
		 * @param {string} text content of dialog
		 * @param {string} title dialog title
		 * @param {Function} callback which will be triggered when user presses OK
		 * @param {boolean} [modal] make the dialog modal
		 */
		info(text, title, callback, modal) {
			// TODO: currently not used in Talk, but should be implemented
			// this.message(text, title, 'info', Dialogs.OK_BUTTON, callback, modal)
			console.warn('OC.dialogs.info is not implemented in Talk Desktop')
		},

		/**
		 * displays alert dialog
		 * @param {string} text content of dialog
		 * @param {string} title dialog title
		 * @param {Function} callback which will be triggered when user presses OK
		 * @param {boolean} [modal] make the dialog modal
		 */
		alert(text, title, callback, modal) {
			return new Promise((resolve) => {
				this.addDialog({
					name: title,
					message: text,
					canClose: !modal,
					buttons: Buttons.OK_BUTTONS((result) => {
						callback(result)
						resolve(result)
					}),
				})
			})
		},

		/**
		 * displays confirmation dialog
		 * @param {string} text content of dialog
		 * @param {string} title dialog title
		 * @param {Function} callback which will be triggered when user presses OK (true or false would be passed to callback respectively)
		 * @param {boolean} [modal] make the dialog modal
		 * @return {Promise}
		 */
		confirm(text, title, callback, modal) {
			return new Promise((resolve) => {
				this.addDialog({
					name: title,
					message: text,
					canClose: !modal,
					buttons: Buttons.YES_NO_BUTTONS((result) => {
						callback(result)
						resolve(result)
					}),
				})
			})
		},

		/**
		 * displays confirmation dialog
		 * @param {string} text content of dialog
		 * @param {string} title dialog title
		 * @param {(number|{type: number, confirm: string, cancel: string, confirmClasses: string})} buttons text content of buttons
		 * @param {Function} callback which will be triggered when user presses OK (true or false would be passed to callback respectively)
		 * @param {boolean} [modal] make the dialog modal
		 * @return {Promise}
		 */
		confirmDestructive(text, title, buttons, callback, modal) {
			return new Promise((resolve) => {
				const theButtons = (typeof buttons === 'object' && buttons.type === 70)
					? (callback) => [{
						label: buttons.cancel || t('talk_desktop', 'No'),
						callback: () => callback?.(false),
					},
					{
						label: buttons.confirm || t('talk_desktop', 'Yes'),
						callback: () => callback?.(true),
						type: 'error',
						// classes: buttons.confirmClasses,
					}]
					: Buttons[OcDialogButtonsENUM[buttons]]

				this.addDialog({
					name: title,
					message: text,
					canClose: !modal,
					buttons: theButtons((result) => {
						callback(result)
						resolve(result)
					}),
				})
			})
		},

		/**
		 * displays prompt dialog
		 * @param {string} text content of dialog
		 * @param {string} title dialog title
		 * @param {Function} callback which will be triggered when user presses OK (true or false would be passed to callback respectively)
		 * @param {boolean} [modal] make the dialog modal
		 * @param {string} name name of the input field
		 * @param {boolean} password whether the input should be a password input
		 * @return {Promise}
		 */
		prompt(text, title, callback, modal, name, password) {
			// TODO: currently not used in Talk, but should be implemented
			console.warn('OC.dialogs.prompt is not implemented in Talk Desktop')
		},
	},
}
</script>
