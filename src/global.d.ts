/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
// TODO: Separate main and renderer globals

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Frontend
 */
declare module '*.css'

declare module '*.svg' {
	const url: string
	export default url
}

declare module 'vue-material-design-icons/*.vue' {
	import type { Component } from 'vue'
	const component: Component<Record<string, never>, Record<string, never>, Record<string, never>, { size: number }, Record<string, never>>
	export default component
}

// @nextcloud/vue has declarations only since 9.0.0
declare module '@nextcloud/vue/dist/Components/*.js' {
	import type { Component } from 'vue'
	const component: Component
	export default component
}

declare const IS_DESKTOP: true
declare const __IS_WINDOWS__: boolean
declare const __IS_MAC__: boolean
declare const __IS_LINUX__: boolean
declare const __IS_WAYLAND__: boolean


declare interface Window {
	// Nextcloud Globals
	t: typeof import('@nextcloud/l10n').t
	n: typeof import('@nextcloud/l10n').n
	OC: any
	OCP: any
	OCA: {
		Talk: {
			TalkDesktop: any
		} & any
	} & any
	// Talk Desktop IPC
	TALK_DESKTOP: any
	OS: any
}

/**
 * Electron Backend
 */

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
}
