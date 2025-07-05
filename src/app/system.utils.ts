/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import os from 'node:os'
import path from 'node:path'
import { BUILD_CONFIG } from '../shared/build.config.ts'

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
 * Is the app running inside Flatpak sandbox?
 * TODO: check if it is reliable. Alternative: check for /.flatpak_info existence
 */
export const isFlatpak = process.env.FLATPAK_ID === BUILD_CONFIG.linuxAppId

/**
 * Is the app running inside any supported Linux sandbox
 */
export const isSandboxed = isFlatpak

/**
 * System information with OS, platform, and installation details
 */
export const systemInfo = {
	isLinux,
	isMac,
	isWindows,
	isWayland,
	isFlatpak,
	isSandboxed,
	osVersion,
	platform,
	execPath: process.execPath,
}

/**
 * Check whether application execution is the same as the current by the execution path
 *
 * @param argv0 - argv0 of the executable run
 * @param cwd - Current working directory of the executable run
 */
export function isSameExecution(argv0: string, cwd: string) {
	// The full path may not be correct inside a sandbox
	// But there could not be other installation in the same sandbox
	// As a workaround - check only the executable name but not the full path
	if (isSandboxed) {
		return path.basename(argv0) === path.basename(process.execPath)
	}

	// Depending on the OS, argv0 could be an absolute path or relative to the cwd
	const execPath = path.isAbsolute(argv0) ? argv0 : path.resolve(cwd, argv0)

	return execPath === process.execPath
}
