/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { app } from 'electron'
import { isWindows } from '../app/system.utils.ts'

/**
 * Chromium feature instructing the Windows.Graphics.Capture API
 * to draw its capture border around the captured window.
 *
 * @see https://learn.microsoft.com/en-us/uwp/api/windows.graphics.capture.graphicscapturesession.isborderrequired
 */
const WGC_REQUIRE_BORDER_FEATURE = 'WebRtcWgcRequireBorder'

/**
 * Let Windows mark a shared window or screen with its own capture border.
 *
 * Windows draws a yellow border around a window or a screen captured via Windows.Graphics.Capture,
 * which Chromium uses for capturing both. The border is drawn by the system on the local screen only,
 * it is not a part of the captured frames, so the other participants of a call never see it.
 *
 * Chromium opts out of this border by default (WebRtcWgcRequireBorder is disabled),
 * which silently removes the only indication of an active sharing on Windows 11.
 * On Windows 10 the border is always drawn, as opting out requires Windows 11.
 *
 * Note: when Chromium falls back to another capture method, there is no border.
 * The application doesn't mark the shared screen on Windows itself,
 * as its marker cannot be excluded from the captured screen there.
 *
 * Must be called before the app is ready, as Chromium features are resolved on startup.
 */
export function applyNativeWindowCaptureBorder() {
	if (!isWindows) {
		return
	}

	// Do not drop features enabled via the command line
	const enabledFeatures = app.commandLine.getSwitchValue('enable-features')
	app.commandLine.appendSwitch('enable-features', [enabledFeatures, WGC_REQUIRE_BORDER_FEATURE].filter(Boolean).join(','))
}
