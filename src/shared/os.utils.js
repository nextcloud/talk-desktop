/*
 * @copyright Copyright (c) 2023 Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
 *
 * @author Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

const os = require('os')

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
	}
}

module.exports = {
	getOsVersion,
	getOsTitle,
	isLinux,
	isMac,
	isWindows,
	isWayland,
	getOs,
}
