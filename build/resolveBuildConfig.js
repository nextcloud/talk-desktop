/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const fs = require('node:fs')
const buildConfigDefaults = require('./build.config.json')
const { UUIDv5 } = require('./UUIDv5.js')

// DO NOT CHANGE
const TALK_DESKTOP_UUID = '007a0d7d-9595-41d2-b5aa-740a5a63e38a'

/**
 * Resolve the build configuration
 *
 * @param {string} [customConfigPath] - Path to the custom configuration file
 * @return {import('./BuildConfig.types.ts').BuildConfig} - Resolved configuration object
 */
function resolveBuildConfig(customConfigPath = process.env.CUSTOM_CONFIG) {
	/** @type {Partial<import('./BuildConfig.types.ts').BuildConfigFile>} */
	const buildConfigOverrides = customConfigPath ? JSON.parse(fs.readFileSync(customConfigPath, 'utf-8')) : {}

	// Remove all undefined values
	// TODO: check if undefined values can be empty strings or only null
	for (const key in buildConfigOverrides) {
		if (buildConfigOverrides[key] === null) {
			delete buildConfigOverrides[key]
		}
	}

	/** @type {import('./BuildConfig.types.ts').BuildConfigFile} */
	const buildConfig = {
		...buildConfigDefaults,
		...buildConfigOverrides,
	}

	// Default an empty '' brandGradient to the brandColor
	buildConfig.brandGradient ||= buildConfig.brandColor

	// Sanitized name - application name without non-alphanumeral characters
	const applicationNameSanitized = buildConfig.applicationName.replace(/[^a-z0-9]/gi, '')

	// Generate appId in DNS notation from domain
	const appIdHost = buildConfig.domain
		? new URL(buildConfig.domain).host.split('.').reverse().join('.')
		: 'com.nextcloud'

	const isBranded = Boolean(customConfigPath)

	return {
		// Default inferred values - can be overridden by the custom config
		appleAppBundleId: `${appIdHost}.talk.mac`,
		linuxAppId: `${appIdHost}.talk`,
		winAppId: `${appIdHost}.talk`,
		description: `Official desktop client for ${buildConfig.applicationName}`,

		// Custom config with defaults
		...buildConfig,

		// Inferred values, cannot be overridden by the custom config
		isBranded,
		companyName: isBranded ? buildConfig.applicationName : 'Nextcloud GmbH',
		copyright: (isBranded ? 'Copyright (c) {year}' : 'Copyright (c) {year} Nextcloud GmbH').replace('{year}', new Date().getFullYear()),
		applicationNameSanitized,
		isPlainBackground: buildConfig.backgroundColor !== buildConfigDefaults.backgroundColor,
		winSquirrelAppId: applicationNameSanitized, // Special case for Squirrel.Windows
		winUpgradeCode: UUIDv5(`${appIdHost}.talk`, TALK_DESKTOP_UUID),
	}
}

module.exports = {
	resolveBuildConfig,
}
