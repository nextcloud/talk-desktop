/*!
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { t } from '@nextcloud/l10n'
import { ref } from 'vue'

/**
 * Enumerate available media devices (audio output) options
 */
export function useAudioDevicesList() {
	const devices = ref<{ label: string, value: string | null }[]>([])

	const EMPTY_DEVICE_OPTION = { label: t('talk_desktop', 'None'), value: null }

	/**
	 * Enumerate available media devices (audio output) options
	 */
	async function reloadDevices() {
		devices.value = []

		let stream = null
		try {
			stream = await navigator.mediaDevices.getUserMedia({ audio: true })
			const deviceOptions = (await navigator.mediaDevices.enumerateDevices() ?? [])
				.filter((device) => device.kind === 'audiooutput')
				.map((device) => ({ value: device.deviceId, label: device.label }))

			devices.value = [EMPTY_DEVICE_OPTION, ...deviceOptions]
		} catch (error) {
			console.error('Error while requesting or initializing audio devices: ', error)
			devices.value = [EMPTY_DEVICE_OPTION]
		} finally {
			if (stream) {
				stream.getTracks().forEach((track) => track.stop())
			}
		}
	}

	reloadDevices()

	return {
		devices,
		reloadDevices,
	}
}
