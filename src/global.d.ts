/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { translate, translatePlural } from '@nextcloud/l10n'

// TODO: Separate main and renderer globals

declare global {
	// Electron Forge built constants
	const AUTHENTICATION_WINDOW_WEBPACK_ENTRY: string
	const AUTHENTICATION_WINDOW_PRELOAD_WEBPACK_ENTRY: string
	const TALK_WINDOW_WEBPACK_ENTRY: string
	const TALK_WINDOW_PRELOAD_WEBPACK_ENTRY: string
	const HELP_WINDOW_WEBPACK_ENTRY: string
	const HELP_WINDOW_PRELOAD_WEBPACK_ENTRY: string
	const UPGRADE_WINDOW_WEBPACK_ENTRY: string
	const UPGRADE_WINDOW_PRELOAD_WEBPACK_ENTRY: string
	const WELCOME_WINDOW_WEBPACK_ENTRY: string
	const WELCOME_WINDOW_PRELOAD_WEBPACK_ENTRY: string

	// ENV
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: 'production' | 'development'
			NEXTCLOUD_DEV_SERVER_HOSTS: string
		}
	}

	// Nextcloud Globals
	const OC: object
	const OCA: object
	const OCP: object
	const t: typeof translate
	const n: typeof translatePlural
	// @nextcloud/webpack-vue-config
	const appName: string
	const appVersion: string
	// Talk Desktop
	const IS_DESKTOP: true
}

export {}
