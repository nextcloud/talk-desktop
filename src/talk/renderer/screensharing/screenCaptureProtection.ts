/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Legacy Chromium desktop-capture constraints used by Electron's getUserMedia path.
 */
type LegacyDesktopConstraints = {
	mandatory?: {
		chromeMediaSource?: string
		chromeMediaSourceId?: string
	}
}

/**
 * Whether the given constraints request a whole-screen desktop capture (the entire
 * desktop or a specific monitor) rather than a single window. Only screen captures can
 * include the Talk window itself and produce the infinite "hall of mirrors".
 *
 * @param constraints - getUserMedia constraints
 */
function isScreenCapture(constraints: MediaStreamConstraints): boolean {
	const video = constraints.video
	if (!video || typeof video === 'boolean') {
		return false
	}
	const mandatory = (video as unknown as LegacyDesktopConstraints).mandatory
	if (!mandatory || mandatory.chromeMediaSource !== 'desktop') {
		return false
	}
	const sourceId = mandatory.chromeMediaSourceId
	// No sourceId → entire desktop; "screen:"/"entire-desktop:" → a monitor; "window:" → a single window
	return !sourceId || sourceId.startsWith('screen:') || sourceId.startsWith('entire-desktop:')
}

/**
 * While the user shares a whole screen, exclude the Talk window from screen capture
 * (`BrowserWindow.setContentProtection`) so it does not appear inside the shared stream —
 * which would otherwise recurse into an infinite "hall of mirrors". No-op on Linux, where
 * the platform has no capture-exclusion primitive (there the spreed-side overlay applies).
 *
 * Implemented by wrapping getUserMedia so both the start (a screen capture is requested)
 * and the end (the capture track stops) are observed, without any change to Talk (spreed).
 */
export function setupScreenCaptureProtection(): void {
	const mediaDevices = navigator.mediaDevices
	if (!mediaDevices?.getUserMedia) {
		return
	}

	// Reset to a known baseline: a freshly (re)loaded page has no active screen share, so the
	// window must be capturable until one starts. This also clears protection that may have been
	// left enabled if the page was reloaded while sharing.
	window.TALK_DESKTOP.setScreenCaptureProtection(false)

	const originalGetUserMedia = mediaDevices.getUserMedia.bind(mediaDevices)

	mediaDevices.getUserMedia = async function(constraints?: MediaStreamConstraints): Promise<MediaStream> {
		const stream = await originalGetUserMedia(constraints)

		if (constraints && isScreenCapture(constraints)) {
			window.TALK_DESKTOP.setScreenCaptureProtection(true)

			let released = false
			const releaseProtection = () => {
				if (released) {
					return
				}
				released = true
				window.TALK_DESKTOP.setScreenCaptureProtection(false)
			}

			for (const track of stream.getVideoTracks()) {
				// 'ended' covers the user stopping via the OS/browser picker;
				// wrapping stop() covers Talk stopping the share programmatically.
				track.addEventListener('ended', releaseProtection, { once: true })
				const originalStop = track.stop.bind(track)
				track.stop = () => {
					originalStop()
					releaseProtection()
				}
			}
		}

		return stream
	}
}
