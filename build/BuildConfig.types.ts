/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export type BuildConfigFile = {
	/***********
	 * General *
	 ***********/

	/**
	 * Application name.
	 * Used in executable file name, installer, shortcuts, window title, etc.
	 * Default: 'Nextcloud Talk'
	 */
	applicationName: string

	/**
	 * Description.
	 * Used in metadata and help.
	 * Default: 'Official Desktop client for {applicationName}'
	 */
	description: string

	/**
	 * Default: null
	 */
	domain: string | null

	/**
	 * Default: false
	 */
	enforceDomain: boolean

	/**
	 * Whether multi account is enabled.
	 * NOT IMPLEMENTED
	 * Default: false
	 */
	multiAccount: boolean

	/**
	 * Brand color.
	 * NOT IMPLEMENTED
	 * Default: '#0082C9'
	 */
	brandColor: string

	/**
	 * Brand font color.
	 * NOT IMPLEMENTED
	 */
	brandFontColor: string

	/**
	 * URL providing users with more information about the product and how to use it.
	 * NOT IMPLEMENTED
	 * Default: 'https://help.nextcloud.com/'
	 */
	helpUrl: string

	/**
	 * URL providing users with more information about the privacy policy of service.
	 * Default: 'https://nextcloud.com/privacy' for app menu and Nextcloud theming settings on the help.
	 */
	privacyUrl: string

	/**
	 * Theming primary color
	 * Default: '#00679e'
	 */
	primaryColor: string

	/**
	 * Theming background color
	 * Default: '#00679e'
	 */
	backgroundColor: string

	/****************
	 * Distribution *
	 ****************/

	/**
	 * Windows one-click single-user installer via Squirrel.Windows.
	 * Default: true
	 */
	windowsExe: boolean

	/**
	 * Windows machine-wide classic installer via WiX v3.
	 * Recommended for administrative environments.
	 * Default: true
	 */
	windowsMsi: boolean

	/**
	 * macOS DMG installer.
	 * Default: true
	 */
	macosDmg: boolean

	/**
	 * Linux Flatpak single-file installer.
	 * Default: true
	 */
	linuxFlatpak: boolean

	/**
	 * Linux .zip archive.
	 * Default: true
	 */
	linuxZip: boolean

	/***************
	 * OS-Specific *
	 ***************/

	/**
	 * Apple AppBundleID for macOS.
	 * Default: 'com.nextcloud.talk.mac'
	 */
	appleAppBundleId: string

	/**
	 * Windows AppUserModelId.
	 * Default: 'com.nextcloud.talk'
	 */
	winAppId: string

	/**
	 * Linux AppId.
	 * Default: 'com.nextcloud.talk'
	 */
	linuxAppId: string
}

/**
 * Computed configs, that cannot be overridden
 */
export type BuildConfigInferred = {
	/**
	 * Whether it is a branded build with a custom config.
	 * Default: false
	 */
	isBranded: boolean

	/**
	 * Application name without non-alphanumeral characters
	 */
	applicationNameSanitized: string

	/**
	 * Whether to have theming backgroundMime='backgroundColor' (plain background color instead of an image).
	 * Currently true whenever backgroundColor is different from the default.
	 * Might change in the future if more flexibility is needed.
	 * Default: false
	 */
	isPlainBackground: boolean

	/**
	 * Windows.Squirrel AppUserModelId suffix for Windows.
	 * It must be Sanitized application name.
	 * Squirrel then will use com.squirrel.{AppId}.{AppId} as AppUserModelId.
	 * Default: 'NextcloudTalk'
	 */
	winSquirrelAppId: string

	/**
	 * WiX MSI's UPGRADE_CODE, GUID.
	 * Must persist between installations (versions) but be different for different branded versions.
	 * See: https://docs.firegiant.com/wix3/xsd/wix/product/ (Attributes | UpgradeCode)
	 */
	winUpgradeCode: string

	/**
	 * Copyright string.
	 * Used in metadata. Cannot be empty.
	 * Copyright (c) {year} Nextcloud GmbH
	 */
	copyright: string

	/**
	 * Company name.
	 * Used in metadata and help.
	 */
	companyName: string
}

export type BuildConfig = BuildConfigFile & BuildConfigInferred
