/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import os from 'node:os'

/**
 * "process.platform", but with simplified to 'win32'|'darwin'|'linux'
 */
export const platform = (process.platform === 'win32' && 'win32')
	|| (process.platform === 'darwin' && 'darwin')
	|| 'linux'

/**
 * A string representing OS version
 *
 * @example "Linux 5.15.0-53-generic (#59-Ubuntu SMP Mon Oct 17 18:53:30 UTC 2022)"
 * @example "Darwin 22.3.0 (Darwin Kernel Version 22.3.0: Thu Jan 5 20:48:54 PST 2023; root:xnu-8792.81.2~2/RELEASE_ARM64_T6000)"
 * @example "Windows_NT 10.0.22621 (Windows 10 Pro)"
 */
export const osVersion = `${os.type()} ${os.release()} (${os.version()})`

/**
 * A "human-readable" well-known OS title from os.type()
 */
export const osTitle = {
	Darwin: 'Macintosh',
	Linux: 'Linux',
	Windows_NT: 'Windows',
	WindowsNT: 'Windows',
}[os.type()] ?? os.type()

/**
 * Is it Linux?
 */
export const isLinux = os.type() === 'Linux'

/**
 * Is it Mac?
 */
export const isMac = os.type() === 'Darwin'

/**
 * Is it Windows?
 */
export const isWindows = os.type() === 'Windows_NT'

/**
 * Is it Linux with Wayland window communication protocol?
 *
 * @todo is it better than checking for XDG_SESSION_TYPE === 'wayland'?
 */
export const isWayland = !!process.env.WAYLAND_DISPLAY

/**
 * System information with OS, platform, and installation details
 */
export const systemInfo = {
	isLinux,
	isMac,
	isWindows,
	isWayland,
	osVersion,
	platform,
	execPath: process.execPath,
}
