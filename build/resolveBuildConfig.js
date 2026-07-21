/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { getAppInfo } from './appinfo.utils.js'
import buildConfigDefaults from './build.config.json' with { type: 'json' }
import { UUIDv5 } from './UUIDv5.js'

// DO NOT CHANGE
const TALK_DESKTOP_UUID = '007a0d7d-9595-41d2-b5aa-740a5a63e38a'

/**
 * Resolve the build configuration
 *
 * @return {import('./BuildConfig.types.ts').BuildConfig} - Resolved configuration object
 */
export function resolveBuildConfig() {
	const buildConfigOverridesPath = join(import.meta.dirname, '../.overrides/build.config.json')

	const isBranded = existsSync(buildConfigOverridesPath)

	/** @type {Partial<import('./BuildConfig.types.ts').BuildConfigFile>} */
	const buildConfigOverrides = isBranded ? JSON.parse(readFileSync(buildConfigOverridesPath, 'utf-8')) : {}

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
		withThemingOverrides: buildConfig.primaryColor !== buildConfigDefaults.primaryColor || buildConfig.backgroundColor !== buildConfigDefaults.backgroundColor,
		winSquirrelAppId: applicationNameSanitized, // Special case for Squirrel.Windows
		winUpgradeCode: UUIDv5(`${appIdHost}.talk`, TALK_DESKTOP_UUID),
	}
}

/**
 * Resolve path to the build-in Talk
 */
export function resolveTalkPath() {
	return process.env.TALK_PATH ? resolve(process.env.TALK_PATH) : resolve(import.meta.dirname, '../spreed')
}

/**
 * Get the built-in Talk's Nextcloud version
 */
export function getNextcloudVersionForTalk() {
	return getAppInfo(resolveTalkPath()).maxVersion
}

/**
 * Try to get the Nextcloud styles from a given directory
 *
 * @param {string} directory - Path to the styles directory, e.g. "resources/server-global-styles"
 * @param {string} version - Nextcloud major version (e.g. 34)
 * @return {{ path: string, meta: Record<string, unknown> } | null} - Styles path and meta data or null if not found
 */
function tryGetNextcloudStyles(directory, version) {
	try {
		const stylesPath = join(directory, version.toString())
		return {
			path: stylesPath,
			meta: JSON.parse(readFileSync(join(stylesPath, 'meta.json'), 'utf-8')),
		}
	} catch {
		return null
	}
}

/**
 * Get available Nextcloud styles
 *
 * @param {string} version - Nextcloud major version (e.g. 34)
 */
export function getNextcloudStyles(version = getNextcloudVersionForTalk()) {
	const BUILD_CONFIG = resolveBuildConfig()

	const base = tryGetNextcloudStyles(join(import.meta.dirname, '../resources/server-global-styles'), version)
	const overrides = tryGetNextcloudStyles(join(import.meta.dirname, '../.overrides/styles'), version)

	if (!base) {
		throw new Error(`Nextcloud ${version} is not supported: no styles found`)
	}

	return {
		base,
		overrides,
		overridesRequired: BUILD_CONFIG.withThemingOverrides,
		overridesUpToDate: overrides
			// Same styles version
			&& overrides.meta.versionCommitHash === base.meta.versionCommitHash
			// On the same theming configuration
			&& overrides.meta.themingConfigs[0].primaryColor === BUILD_CONFIG.primaryColor
			&& overrides.meta.themingConfigs[0].backgroundColor === BUILD_CONFIG.backgroundColor,
	}
}

/**
 * Resolve path to the currently used Nextcloud styles
 *
 * @param {string} version - Nextcloud major version (e.g. 34)
 */
export function resolveNextcloudStylesPath(version = getNextcloudVersionForTalk()) {
	const styles = getNextcloudStyles(version)

	if (!styles.overrides && styles.overridesRequired) {
		throw new Error(`Nextcloud ${version} styles overrides are missing. `
			+ `If you are testing the build locally, run "node scripts/override-nextcloud-styles.js --version ${version}".`)
	}

	if (styles.overrides && !styles.overridesUpToDate) {
		throw new Error(`Nextcloud ${version} styles overrides are not up-to-date with the current styles version or the build configuration. `
			+ `If you are testing the build locally, run "node scripts/override-nextcloud-styles.js --version ${version}".`)
	}

	return styles.overrides?.path ?? styles.base.path
}
