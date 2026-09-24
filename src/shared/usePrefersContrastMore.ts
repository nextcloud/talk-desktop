/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { createSharedComposable } from '@vueuse/core'
import { onScopeDispose, ref } from 'vue'

/**
 * Get reactive (prefers-contrast: more) match media equivalent from Electron API
 * Unlike `prefers-color-scheme`, Electron does not set `prefers-contrast` according to the system settings ...
 */
export const usePrefersContrastMore = createSharedComposable(() => {
	const prefersContrastMore = ref(window.TALK_DESKTOP.getPrefersContrastMore())

	const unsubscribe = window.TALK_DESKTOP.onPrefersContrastMoreChange((value: boolean) => {
		prefersContrastMore.value = value
	})

	onScopeDispose(unsubscribe)

	return prefersContrastMore
})
