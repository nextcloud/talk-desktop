/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const fs = require('node:fs')
const defaultConfig = require('./config.json')
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
	const customConfig = customConfigPath ? JSON.parse(fs.readFileSync(customConfigPath, 'utf-8')) : {}

	// Remove all undefined values
	// TODO: check if undefined values can be empty strings or only null
	for (const key in customConfig) {
		if (customConfig[key] === null) {
			delete customConfig[key]
		}
	}

	/** @type {import('./BuildConfig.types.ts').BuildConfigFile} */
	const config = {
		...defaultConfig,
		...customConfig,
	}

	// Sanitized name - application name without non-alphanumeral characters
	const applicationNameSanitized = config.applicationName.replace(/[^a-z0-9]/gi, '')

	// Generate appId in DNS notation from domain
	const appIdHost = config.domain
		? new URL(config.domain).host.split('.').reverse().join('.')
		: 'com.nextcloud'

	const isBranded = Boolean(customConfigPath)

	return {
		// Default inferred values - can be overridden by the custom config
		appleAppBundleId: `${appIdHost}.talk.mac`,
		linuxAppId: `${appIdHost}.talk`,
		winAppId: `${appIdHost}.talk`,
		description: `Official desktop client for ${config.applicationName}`,

		// Custom config with defaults
		...config,

		// Inferred values, cannot be overridden by the custom config
		isBranded,
		companyName: isBranded ? config.applicationName : 'Nextcloud GmbH',
		copyright: (isBranded ? 'Copyright (c) {year}' : 'Copyright (c) {year} Nextcloud GmbH').replace('{year}', new Date().getFullYear()),
		applicationNameSanitized,
		isPlainBackground: config.backgroundColor !== defaultConfig.backgroundColor,
		winSquirrelAppId: applicationNameSanitized, // Special case for Squirrel.Windows
		winUpgradeCode: UUIDv5(`${appIdHost}.talk`, TALK_DESKTOP_UUID),
	}
}

module.exports = {
	resolveConfig: resolveBuildConfig,
}
