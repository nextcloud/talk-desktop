/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-FileCopyrightText: 2016 Samuel Attard
 * SPDX-License-Identifier: AGPL-3.0-or-later and MIT
 */

const { getNameFromAuthor } = require('@electron-forge/core-utils')
const { MakerBase } = require('@electron-forge/maker-base')
const { MSICreator } = require('electron-wix-msi')
const path = require('node:path')
const { styleText } = require('node:util')
const semver = require('semver')

/**
 *
 * @param arch
 */
function isValidWixArch(arch) {
	return ['x64', 'ia64', 'x86'].includes(arch)
}

class MakerWix extends MakerBase {
	name = 'wix'

	defaultPlatforms = ['win32']

	isSupportedOnCurrentPlatform() {
		return process.platform === 'win32'
	}

	async make({
		dir,
		makeDir,
		targetArch,
		packageJSON,
		appName,
	}) {
		const outPath = path.resolve(makeDir, `wix/${targetArch}`)
		await this.ensureDirectory(outPath)

		const { version } = packageJSON
		const parsed = semver.parse(version)
		if (
			(Array.isArray(parsed?.prerelease) && parsed.prerelease.length > 0)
			|| (Array.isArray(parsed?.build) && parsed.build.length > 0)
		) {
			console.warn(
				styleText('yellow', '⚠'),
				styleText(
					'yellow',
					'WARNING: MSI packages follow Windows version format "major.minor.build.revision".\n'
					+ `The provided semantic version "${version}" will be transformed to Windows version format. Prerelease component will not be retained.`,
				),
			)
		}

		if (!isValidWixArch(targetArch)) {
			throw new Error(`Invalid arch: ${targetArch}`)
		}

		const creator = new MSICreator({
			description: packageJSON.description,
			name: appName,
			version,
			manufacturer: getNameFromAuthor(packageJSON.author),
			exe: `${appName}.exe`,
			arch: targetArch,
			...this.config,
			appDirectory: dir,
			outputDirectory: outPath,
		})

		if (this.config.beforeCreate) {
			await Promise.resolve(this.config.beforeCreate(creator))
		}
		await creator.create()

		const { msiFile } = await creator.compile()

		return [msiFile]
	}
}

module.exports = { MakerWix }
