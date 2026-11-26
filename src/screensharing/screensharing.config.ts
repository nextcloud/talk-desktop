/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { app } from 'electron'
import { isWindows } from '../app/system.utils.ts'

/**
 * Enable the capture border on Windows: a colored border around the window or display to indicate that a capture is in progress.
 * Chromium has it disabled by default.
 *
 * @see https://learn.microsoft.com/en-us/uwp/api/windows.graphics.capture.graphicscapturesession.isborderrequired
 * @see https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.39/media/webrtc/webrtc_features.cc#20
 */
export function enableWindowsCaptureBorder() {
	if (!isWindows) {
		return
	}

	// Do not drop features enabled via the command line
	const enabledFeatures = app.commandLine.getSwitchValue('enable-features')
	app.commandLine.appendSwitch('enable-features', [enabledFeatures, 'WebRtcWgcRequireBorder'].filter(Boolean).join(','))
}
