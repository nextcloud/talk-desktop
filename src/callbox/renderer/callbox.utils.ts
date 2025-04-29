/*
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { HowlOptions } from 'howler'

import { loadState } from '@nextcloud/initial-state'
import { generateFilePath } from '@nextcloud/router'
import { Howl } from 'howler'
import { getAppConfigValue } from '../../shared/appConfig.service.ts'

/**
 * Play ringtone
 *
 * @return function to stop ringing
 */
export function playRingtone() {
	if (!loadState('notifications', 'sound_talk')) {
		return
	}

	const howlPayload: HowlOptions = {
		src: [generateFilePath('notifications', 'img', 'talk.ogg')],
		html5: true, // to access HTMLAudioElement property 'sinkId'
		volume: 0.5,
		loop: true,
	}
	const sound = new Howl(howlPayload)
	sound.play()

	// TODO find a better way to access the underlying HTMLAudioElement or get rid of Howl
	// @ts-expect-error required private property
	const audioElement = sound._sounds[0]._node

	const secondarySpeaker = getAppConfigValue('secondarySpeaker')
	const secondarySpeakerDevice = getAppConfigValue('secondarySpeakerDevice')

	const primarySpeakerDevice = audioElement.sinkId ?? ''
	let soundDuped: Howl
	if (secondarySpeaker && secondarySpeakerDevice && primarySpeakerDevice !== secondarySpeakerDevice) {
		soundDuped = new Howl(howlPayload)
		audioElement.setSinkId(secondarySpeakerDevice)
			.then(() => console.debug('Audio output successfully redirected to secondary speaker'))
			.catch((error: Error) => console.error('Failed to redirect audio output:', error))
		soundDuped.play()
	}

	return () => {
		sound.stop()
		soundDuped?.stop()
	}
}
