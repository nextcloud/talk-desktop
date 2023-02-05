/*
 * @copyright Copyright (c) 2023 Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
 *
 * @author Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
 *
 * @license GNU AGPL version 3 or any later version
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
import { loadServerCss } from '../../shared/utils/loadCss.js'
import { getCapabilities, getCurrentUserData } from '../../shared/ocs.service.js'
import { setCapabilities, setUserMetadata } from '../../shared/globalsStore.service.js'

export async function init() {
	// Manually redirect on Talk's main page
	// TODO: better add alias to router
	window.location.hash = '/apps/spreed'

	// TODO: Move this part to application initialization
	// Capabilities
	const capabilities = await getCapabilities()
	setCapabilities(capabilities.capabilities)

	// TODO: Move this part to application initialization
	// UserMetadata
	const userMetadata = await getCurrentUserData()
	setUserMetadata(userMetadata)

	// Load application styles from server
	loadServerCss(`/apps/theming/css/default.css`)
	loadServerCss(`/index.php/apps/theming/theme/light.css`)
	loadServerCss(`/index.php/apps/theming/theme/dark.css`)
	loadServerCss(`/core/css/server.css`)

	// Set locale
	document.documentElement.lang = userMetadata.language
	document.documentElement.dataset.locale = userMetadata.locale
	userMetadata.language = 'de'
	// l10n
	if (userMetadata.language !== 'en') {
		try {
			const { default: translationsBundle } = await import(`@talk/l10n/${userMetadata.language}.json`)
			register('spreed', translationsBundle.translations)
		} catch (e) {
			console.log(`Language pack "${userMetadata.language}" not found...`)
		}
	}
}
