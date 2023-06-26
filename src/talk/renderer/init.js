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

import { register } from '@nextcloud/l10n'
import { loadServerCss } from '../../shared/resource.utils.js'
import { appData } from '../../app/AppData.js'

/**
 * Initialize Talk application: styles, localization etc.
 *
 * @return {Promise<object>}
 */
export async function init() {
	// Load application styles from server
	await Promise.all([
		loadServerCss('/apps/theming/css/default.css'),
		loadServerCss('/index.php/apps/theming/theme/light.css'),
		loadServerCss('/index.php/apps/theming/theme/dark.css'),
		loadServerCss('/core/css/server.css'),
	])

	// Load styles overrides
	await import('./assets/overrides.css')

	// Set locale
	document.documentElement.lang = appData.userMetadata.language
	document.documentElement.dataset.locale = appData.userMetadata.locale

	// l10n
	if (appData.userMetadata.language !== 'en') {
		try {
			const { default: translationsBundle } = await import(`@talk/l10n/${appData.userMetadata.language}.json`)
			register('spreed', translationsBundle.translations)
		} catch (e) {
			console.log(`Language pack "${appData.userMetadata.language}" for spreed not found...`)
		}

		try {
			const { default: translationsBundle } = await import(`../../../l10n/${appData.userMetadata.language}.json`)
			register('talk_desktop', translationsBundle.translations)
		} catch (e) {
			console.log(`Language pack "${appData.userMetadata.language}" for talk_desktop not found...`)
		}
	}

	// Get Talk's router and store
	const { default: router } = await import('@talk/src/router/router.js')
	const { default: store } = await import('@talk/src/store/index.js')

	// If there is a talkHash - set it before the app start
	if (appData.talkHash) {
		await store.dispatch('setNextcloudTalkHash', appData.talkHash)
	}
	// Subscribe store to react on talk hash update
	store.subscribe((mutation, state) => {
		if (mutation.type === 'setInitialNextcloudTalkHash') {
			appData.setTalkHash(state.talkHashStore.initialNextcloudTalkHash).persist()
		} else if (mutation.type === 'markNextcloudTalkHashDirty') {
			appData.setTalkHashDirty(true).persist()
			// TODO: make soft restart?
			window.TALK_DESKTOP.relaunch()
		}
	})

	return {
		router,
		store,
	}
}
