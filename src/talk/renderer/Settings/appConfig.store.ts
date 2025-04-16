/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Ref } from 'vue'
import type { AppConfig, AppConfigKey } from '../../../app/AppConfig.ts'
import { readonly, ref, set, watch, watchEffect } from 'vue'
import { defineStore } from 'pinia'
import { getAppConfig } from '../../../shared/appConfig.service.ts'
import { setInitialState } from '../../../shared/initialState.service.js'
import { useUserStatusStore } from '../UserStatus/userStatus.store.ts'

export const useAppConfigStore = defineStore('appConfig', () => {
	const appConfig: Ref<AppConfig> = ref(getAppConfig())
	const isRelaunchRequired = ref(false)
	const relaunchRequiredConfigs = ['systemTitleBar', 'monochromeTrayIcon'] as const

	window.TALK_DESKTOP.onAppConfigChange((event: unknown, { key, value }: { key: AppConfigKey, value: unknown }) => {
		set(appConfig.value, key, value)
	})

	const unwatchRelaunch = watch(
		() => relaunchRequiredConfigs.map((key) => appConfig.value[key]),
		() => {
			isRelaunchRequired.value = true
			unwatchRelaunch()
		},
	)

	const userStatusStore = useUserStatusStore()
	watchEffect(() => {
		const playSoundChat = appConfig.value.playSoundChat && userStatusStore.userStatus?.status !== 'dnd'
		const playSoundCall = appConfig.value.playSoundCall && userStatusStore.userStatus?.status !== 'dnd'
		setInitialState('notifications', 'sound_notification', playSoundChat)
		setInitialState('notifications', 'sound_talk', playSoundCall)
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
		set(appConfig.value, key, value)
		window.TALK_DESKTOP.setAppConfig(key, value)
	}

	return {
		isRelaunchRequired: readonly(isRelaunchRequired),
		appConfig: readonly(appConfig),
		getAppConfigValue,
		setAppConfigValue,
	}
})
