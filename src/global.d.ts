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

declare module '*.svg?raw' {
	const url: string
	export default url
}

declare module 'vue-material-design-icons/*.vue' {
	import type { Component } from 'vue'
	const component: Component<Record<string, never>, Record<string, never>, Record<string, never>, { size: number }, Record<string, never>>
	export default component
}

// @nextcloud/vue has declarations only since 9.0.0
declare module '@nextcloud/vue/components/*' {
	import type { Component } from 'vue'
	const component: Component
	export default component
}
declare module '@nextcloud/vue/composables/useHotKey' {
	export function useHotKey(
		keysOrFilter: string | string[] | ((event: KeyboardEvent) => boolean) | true,
		callback: (event: KeyboardEvent) => void,
		options?: {
			push?: boolean
			prevent?: boolean
			stop?: boolean
			ctrl?: boolean
			alt?: boolean
			shift?: boolean
			caseSensitive?: boolean
		}
	): () => void
}

// Built-time constants
declare const IS_DESKTOP: true
declare const __IS_DESKTOP__: true
declare const __CHANNEL__: 'stable' | 'beta' | 'dev'
declare const __VERSION_TAG__: string
declare const __TALK_VERSION_TAG__: string

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
	systemInfo: typeof import('./app/system.utils.ts').systemInfo
}

/**
 * Electron Backend
 */

// Electron Forge built constants
declare const AUTHENTICATION_WINDOW_WEBPACK_ENTRY: string
declare const AUTHENTICATION_WINDOW_PRELOAD_WEBPACK_ENTRY: string
declare const CALLBOX_WINDOW_PRELOAD_WEBPACK_ENTRY: string
declare const CALLBOX_WINDOW_WEBPACK_ENTRY: string
declare const TALK_WINDOW_WEBPACK_ENTRY: string
declare const TALK_WINDOW_PRELOAD_WEBPACK_ENTRY: string
declare const HELP_WINDOW_WEBPACK_ENTRY: string
declare const HELP_WINDOW_PRELOAD_WEBPACK_ENTRY: string
declare const UPGRADE_WINDOW_WEBPACK_ENTRY: string
declare const UPGRADE_WINDOW_PRELOAD_WEBPACK_ENTRY: string
declare const WELCOME_WINDOW_WEBPACK_ENTRY: string
declare const WELCOME_WINDOW_PRELOAD_WEBPACK_ENTRY: string

declare global {
	// ENV
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: 'production' | 'development'
			CHANNEL: 'stable' | 'beta'
			NEXTCLOUD_DEV_SERVER_HOSTS: string
		}
	}
}
