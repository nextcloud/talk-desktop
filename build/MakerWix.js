/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-FileCopyrightText: 2016 Samuel Attard
 * SPDX-License-Identifier: AGPL-3.0-or-later and MIT
 */

const { getNameFromAuthor } = require('@electron-forge/core-utils')
const { MakerBase } = require('@electron-forge/maker-base')
const { sign } = require('@electron/windows-sign')
const { MSICreator } = require('electron-wix-msi')
const path = require('node:path')
const { styleText } = require('node:util')
const semver = require('semver')

/**
 *
 * @param arch
 */
function isValidWixArch(arch) {
	// Upstream: https://github.com/electron/forge/pull/4471

	// arm64 is not officially supported by electron-wix-msi
	// But it is supported by WiX toolset v3.14 and later
	// And it does not break in electron-wix-msi
	// Ref: https://github.com/electron-userland/electron-wix-msi/issues/150
	return ['x64', 'ia64', 'x86', 'arm64'].includes(arch)
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

		// ---- Begin: Added for nextcloud/talk-desktop

		// Upstream: https://github.com/electron/forge/pull/4472

		const { supportBinaries } = await creator.create()

		const {
			windowsSign,
			signWithParams,
			certificateFile,
			certificatePassword,
		} = this.config

		// Additionally sign the stub executable and Update.exe
		if (windowsSign) {
			await sign({
				...windowsSign,
				files: supportBinaries,
			})
		} else if (signWithParams || certificateFile || certificatePassword) {
			// Deprecated options
			await sign({
				signWithParams,
				certificateFile,
				certificatePassword,
				files: supportBinaries,
			})
		}

		// ---- End: Added for nextcloud/talk-desktop

		const { msiFile } = await creator.compile()

		return [msiFile]
	}
}

module.exports = { MakerWix }
