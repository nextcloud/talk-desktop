/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Ref } from 'vue'
import type { AppConfig } from '../../../app/AppConfig.ts'
import { readonly, ref, watch, watchEffect } from 'vue'
import { defineStore } from 'pinia'
import { getAppConfig } from '../../../shared/appConfig.service.ts'
import { applyBodyThemeAttrs } from '../../../shared/theme.utils.js'
import { setInitialState } from '../../../shared/initialState.service.js'
import { useUserStatusStore } from '../UserStatus/userStatus.store.js'

export const useAppConfig = defineStore('appConfig', () => {
	const appConfig: Ref<AppConfig> = ref(getAppConfig())
	const isRelaunchRequired = ref(false)
	const relaunchRequiredConfigs = ['systemTitleBar', 'monochromeTrayIcon'] as const

	const unwatchRelaunch = watch(
		() => relaunchRequiredConfigs.map((key) => appConfig.value[key]),
		() => {
			isRelaunchRequired.value = true
			unwatchRelaunch()
		},
	)

	watch(() => appConfig.value.theme, (newTheme) => applyBodyThemeAttrs(newTheme))

	const userStatusStore = useUserStatusStore()
	watchEffect(() => {
		const playSound = appConfig.value.playSound === 'respect-dnd'
			? userStatusStore.userStatus?.status !== 'dnd'
			: appConfig.value.playSound === 'always'
		setInitialState('notifications', 'sound_notification', playSound)
		setInitialState('notifications', 'sound_talk', playSound)
	})

	/**
	 * Get an application config value
	 * @param key - The key of the config value
	 * @return - The config
	 */
	function getAppConfigValue<K extends keyof AppConfig>(key: K) {
		return appConfig.value[key]
	}

	/**
	 * Set an application config value
	 * @param key - The key of the config value
	 * @param value - The value to set
	 */
	function setAppConfigValue<K extends keyof AppConfig>(key: K, value: AppConfig[K]) {
		appConfig.value[key] = value
		window.TALK_DESKTOP.setAppConfig(key, value)
	}

	return {
		isRelaunchRequired: readonly(isRelaunchRequired),
		appConfig: readonly(appConfig),
		getAppConfigValue,
		setAppConfigValue,
	}
})
