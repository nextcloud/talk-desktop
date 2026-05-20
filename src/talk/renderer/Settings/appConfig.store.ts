/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Ref } from 'vue'
import type { AppConfig, AppConfigKey } from '../../../app/AppConfig.ts'

import { defineStore } from 'pinia'
import { readonly, ref, watch } from 'vue'
import { getAppConfig } from '../../../shared/appConfig.service.ts'
import { setTheming } from '../../../shared/theme.utils.ts'
import { useMatchMedia } from '../../../shared/useMatchMedia.ts'

export const useAppConfigStore = defineStore('appConfig', () => {
	const appConfig: Ref<AppConfig> = ref(getAppConfig())
	const isRelaunchRequired = ref(false)
	const relaunchRequiredConfigs = ['systemTitleBar', 'monochromeTrayIcon'] as const

	window.TALK_DESKTOP.onAppConfigChange(<T extends AppConfigKey>(event: unknown, { key, value }: { key: T, value: AppConfig[T] }) => {
		appConfig.value[key] = value
	})

	const unwatchRelaunch = watch(
		() => relaunchRequiredConfigs.map((key) => appConfig.value[key]),
		() => {
			isRelaunchRequired.value = true
			unwatchRelaunch()
		},
	)

	const prefersDark = useMatchMedia('(prefers-color-scheme: dark)')
	watch(() => [appConfig.value.theme, appConfig.value.highContrast, appConfig.value.dyslexicFont, prefersDark.value], () => {
		setTheming({
			colorScheme: appConfig.value.theme,
			highContrast: appConfig.value.highContrast,
			openDyslexic: appConfig.value.dyslexicFont,
		})
	})

	/**
	 * Get an application config value
	 *
	 * @param key - The key of the config value
	 * @return - The config
	 */
	function getAppConfigValue<K extends AppConfigKey>(key: K) {
		return appConfig.value[key]
	}

	/**
	 * Set an application config value
	 *
	 * @param key - The key of the config value
	 * @param value - The value to set
	 */
	function setAppConfigValue<K extends AppConfigKey>(key: K, value: AppConfig[K]) {
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
