/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const path = require('node:path')
const fs = require('node:fs')
const defultConfig = require('./config.json')

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
	// TODO: check if undefiend values can be empty strings or only null
	for (const key in customConfig) {
		if (customConfig[key] === null) {
			delete customConfig[key]
		}
	}

	/** @type {import('./BuildConfig.types.ts').BuildConfigFile} */
	const config = {
		...defultConfig,
		...customConfig,
	}

	// Sanitized name - application name without non-alphanumeral characters
	config.applicationNameSanitized = config.applicationName.replace(/[^a-z0-9]/gi, '')

	// Replace {year} in copyright
	config.copyright = config.copyright?.replace('{year}', new Date().getFullYear())

	// Generate appId in DNS notation from domain
	const appIdHost = config.domain
		? new URL(config.domain).host.split('.').reverse().join('.')
		: 'com.nextcloud'

	return {
		// Default computed values - can be overridden by the custom config
		appleAppBundleId: `${appIdHost}.talk.mac`,
		linuxAppId: `${appIdHost}.talk`,
		winAppId: `${appIdHost}.talk`,
		description: `Official desktop client for ${config.applicationName}`,

		// Custom config with defaults
		...config,

		// Computed values, cannot be overridden by the custom config
		isBranded: Boolean(customConfigPath),
		applicationNameSanitized: config.applicationNameSanitized, // Specific sanitized application name - requirement from Squirrel.Windows
		winSquirrelAppId: config.applicationNameSanitized, // Special case for Squirrel.Windows
	}
}

module.exports = {
	resolveConfig: resolveBuildConfig,
}
