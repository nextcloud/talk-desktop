/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const os = require('os')

/**
 * Get "process.platform", but with simplified to 'win32'|'darwin'|'linux'
 * @return {'win32'|'darwin'|'linux'} platform
 */
function getPlatform() {
	return (process.platform === 'win32' && 'win32')
		|| (process.platform === 'darwin' && 'darwin')
		|| 'linux'
}

/**
 * Returns a string representing OS version
 *
 * @return {string} os version
 * @example "Linux 5.15.0-53-generic (#59-Ubuntu SMP Mon Oct 17 18:53:30 UTC 2022)"
 * @example "Darwin 22.3.0 (Darwin Kernel Version 22.3.0: Thu Jan  5 20:48:54 PST 2023; root:xnu-8792.81.2~2/RELEASE_ARM64_T6000)"
 * @example "Windows_NT 10.0.22621 (Windows 10 Pro)"
 */
function getOsVersion() {
	return `${os.type()} ${os.release()} (${os.version()})`
}

/**
 * Transform os.type() to a "human-readable" well-known OS title
 *
 * @return {string}
 */
function getOsTitle() {
	const typeToTitle = {
		Darwin: 'Macintosh',
		Linux: 'Linux',
		Windows_NT: 'Windows',
		WindowsNT: 'Windows',
	}

	return typeToTitle[os.type()] ?? os.type()
}

/**
 * Is it Linux?
 *
 * @return {boolean}
 */
function isLinux() {
	return os.type() === 'Linux'
}

/**
 * Is it Mac?
 *
 * @return {boolean}
 */
function isMac() {
	return os.type() === 'Darwin'
}

/**
 * Is it Windows?
 *
 * @return {boolean}
 */
function isWindows() {
	return os.type() === 'Windows_NT'
}

/**
 * Is it Linux with Wayland window communication protocol?
 * @return {boolean}
 */
function isWayland() {
	// TODO: is it better than checking for XDG_SESSION_TYPE === 'wayland'?
	return !!process.env.WAYLAND_DISPLAY
}

/**
 * @typedef OsVersion
 * @property {boolean} isLinux - Is Linux?
 * @property {boolean} isMac - Is Mac?
 * @property {boolean} isWindows - Is Windows?
 * @property {boolean} isWayland - Is Linux with Wayland window communication protocol?
 * @property {string} version - Full string representation of OS version
 * @property {string} platform - Simplified platform name
 */

/**
 * Get current OS version and versions as flags
 *
 * @return {OsVersion}
 */
function getOs() {
	return {
		isLinux: isLinux(),
		isMac: isMac(),
		isWindows: isWindows(),
		isWayland: isWayland(),
		version: getOsVersion(),
		platform: getPlatform(),
	}
}

module.exports = {
	getPlatform,
	getOsVersion,
	getOsTitle,
	isLinux,
	isMac,
	isWindows,
	isWayland,
	getOs,
}
