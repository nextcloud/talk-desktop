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

import { translate, translatePlural } from '@nextcloud/l10n';

// TODO: Separate main and renderer globals

declare global {
	// Electron Forge built constants
	const ACCOUNTS_WINDOW_WEBPACK_ENTRY: string
	const ACCOUNTS_WINDOW_PRELOAD_WEBPACK_ENTRY: string
	const TALK_WINDOW_WEBPACK_ENTRY: string
	const TALK_WINDOW_PRELOAD_WEBPACK_ENTRY: string
	const WELCOME_WINDOW_WEBPACK_ENTRY: string

	// ENV
	namespace NodeJS {
		interface ProcessEnv {
			NEXTCLOUD_DEV_SERVER_HOSTS: string
		}
	}

	// Nextcloud Globals
	const OC: Object
	const OCA: Object
	const OCP: Object
	const t: typeof translate
	const n: typeof translatePlural
	// @nextcloud/webpack-vue-config
	const appName: string
	const appVersion: string
	// Talk Desktop
	const IS_TALK_DESKTOP: true
}

export {}
