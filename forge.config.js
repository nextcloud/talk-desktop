/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { MakerDMG } = require('@electron-forge/maker-dmg')
const { MakerFlatpak } = require('@electron-forge/maker-flatpak')
const { MakerSquirrel } = require('@electron-forge/maker-squirrel')
const { MakerWix } = require('@electron-forge/maker-wix')
const { MakerZIP } = require('@electron-forge/maker-zip')
const cheerio = require('cheerio')
const fs = require('node:fs')
const path = require('node:path')
const semver = require('semver')
const { resolveConfig } = require('./build/resolveBuildConfig.js')
const packageJSON = require('./package.json')
const { MIN_REQUIRED_BUILT_IN_TALK_VERSION } = require('./src/constants.js')

require('dotenv').config()

const CONFIG = resolveConfig()

console.info('Building with a build configuration:')
console.info(JSON.stringify(CONFIG, null, 2))

/**
 * Generate the distribution name
 *
 * @param {'darwin'|'linux'|'win32'} platform - Distribution target platform
 * @param {'arm64'|'universal'|'x64'} arch - Distribution target architecture
 * @param {string} ext - File extension
 * @return {string} The distribution name, e.g., Nextcloud.Talk-v1.0.0-macos-x64.dmg
 * @example Nextcloud.Talk-macos-universal.dmg
 * @example Nextcloud.Talk-linux-x64.flatpak
 * @example Nextcloud.Talk-windows-x64.exe
 * @example Nextcloud.Talk-beta-windows-x64.exe
 */
function generateDistName(platform, arch, ext) {
	// Map technical platform name to user-friendly
	const platformTitles = {
		darwin: 'macos',
		linux: 'linux',
		win32: 'windows',
	}
	const archTitles = {
		x64: 'x64',
		arm64: 'arm',
	}
	const platformTitle = platformTitles[platform] ?? platform
	const archTitle = archTitles[arch] ?? arch
	const CHANNEL = process.env.CHANNEL ?? 'stable'
	const channel = CHANNEL !== 'stable' ? CHANNEL : ''
	const name = CONFIG.applicationName.replace(/[^a-z0-9]/gi, '.')

	return [name, channel, platformTitle, archTitle].filter(Boolean).join('-') + ext
}

/**
 * Move the artifact to the correct location
 *
 * @param {string} artifactPath - The path to the distribution
 * @param {string} platform - platform
 * @param {string} arch - architecture
 * @return {string} - The new path to the distribution
 */
function fixArtifactName(artifactPath, platform, arch) {
	const artifactName = path.basename(artifactPath)
	const ext = path.extname(artifactName)

	// For Squirrel.Windows names are configurable in the maker
	if (platform === 'win32' && ext === '.exe') {
		return artifactPath
	}

	const name = generateDistName(platform, arch, ext)
	const output = path.join(path.dirname(artifactPath), name)
	if (name !== artifactName) {
		console.log(`Renaming ${artifactName} to ${name}`)
		fs.renameSync(artifactPath, output)
	}
	return output
}

/**
 * Convert signWithParams string to @electron/windows-sign options
 * to fix issues of @electron/windows-sign
 *
 * @param {string} signWithParams - @electron/windows-sign's signWithParams string
 * @return {object} - @electron/windows-sign options
 */
function signWithParamsToWindowsSignOptions(signWithParams) {
	// @electron/windows-sign options
	const windowsSign = {}

	// Split args values without quotes wrap
	// Otherwise @electron/windows-sign will treat double quotes as part of the value
	// See: https://github.com/electron/windows-sign/issues/45
	const parsed = [...signWithParams.matchAll(/(?:([^\s"]+)|"([^"]*)")+/g)].map((matched) => matched[1] || matched[2])

	// @electron/windows-sign has some default options that define signtool params.
	// Duplicating any param leads to an error in the signtool.
	// So avoid this, any param that can be defined in options must be set as an option
	// and removed from params string.
	// See: https://github.com/electron/windows-sign/issues/46
	// Note: multiple hashes is not supported

	const extractOption = (param, option) => {
		const index = parsed.indexOf(param)
		if (index !== -1) {
			const withValue = parsed[index + 1] && !parsed[index + 1].startsWith('/')
			windowsSign[option] = withValue ? parsed[index + 1] : true
			parsed.splice(index, withValue ? 2 : 1)
		}
	}

	extractOption('/a', 'automaticallySelectCertificate')
	extractOption('/as', 'appendSignature')
	extractOption('/tr', 'timestampServer')
	extractOption('/td', 'hashes')
	extractOption('/t', 'timestampServer')
	extractOption('/f', 'certificateFile')
	extractOption('/p', 'certificatePassword')
	extractOption('/fd', 'hashes')
	extractOption('/d', 'description')
	extractOption('/du', 'website')
	extractOption('/debug', 'debug')
	if (windowsSign.hashes) {
		// @electron/window-sign only supports lower case hash
		windowsSign.hashes = windowsSign.hashes.toLowerCase()
	}

	// Set parsed to an array to avoid quoting issues
	windowsSign.signWithParams = parsed

	return windowsSign
}

const hasMacosSign = !!(process.env.APPLE_ID && process.env.APPLE_ID_PASSWORD && process.env.APPLE_TEAM_ID)
const hasWindowsSign = !!process.env.WINDOWS_SIGN_PARAMS

const TALK_PATH = path.resolve(__dirname, process.env.TALK_PATH ?? 'spreed')
let talkPackageJson

module.exports = {
	hooks: {
		generateAssets() {
			if (!fs.existsSync(TALK_PATH)) {
				throw new Error(`Path does not exist TALK_PATH=${TALK_PATH}`)
			}

			try {
				talkPackageJson = require(path.join(TALK_PATH, 'package.json'))
			} catch {
				throw new Error(`No Nextcloud Talk (spreed repository) has been found in TALK_PATH=${TALK_PATH}`)
			}

			if (talkPackageJson.name !== 'talk') {
				throw new Error(`No Nextcloud Talk (spreed repository) but "${talkPackageJson.name}" has been found in TALK_PATH=${TALK_PATH}`)
			}

			if (semver.lte(talkPackageJson.version, MIN_REQUIRED_BUILT_IN_TALK_VERSION)) {
				throw new Error(`The minimum supported version of built-in Nextcloud Talk is ${MIN_REQUIRED_BUILT_IN_TALK_VERSION}, but ${talkPackageJson.version} has been found in TALK_PATH=${TALK_PATH}`)
			}

			if (!fs.existsSync(path.join(TALK_PATH, 'node_modules'))) {
				throw new Error(`No Nextcloud Talk (spreed repository) dependencies are installed.\nTry to execute \`npm ci --prefix="${TALK_PATH}"\``)
			}
		},

		postStart() {
			console.log(`Started with built-in Nextcloud Talk v${talkPackageJson.version} on path: ${TALK_PATH}`)
		},

		postPackage() {
			console.log(`Packaged with built-in Nextcloud Talk v${talkPackageJson.version} on path: ${TALK_PATH}`)
		},

		postMake(config, makeResults) {
			// All makers have different output paths, incl. folder structure, and filenames.
			// In most of them, there is no option to specify or override it.
			// Hotfix: manually move files to the correct location.
			// Alternatives
			// - create own makers
			// - fork electron/forge makers, add features and upstream
			// - do not use electron-forge makers
			return makeResults.map((makeResult) => ({
				...makeResult,
				artifacts: makeResult.artifacts.map((artifact) => fixArtifactName(artifact, makeResult.platform, makeResult.arch)),
			}))
		},
	},

	// https://electron.github.io/packager/main/interfaces/Options.html
	packagerConfig: {
		// Common
		name: CONFIG.applicationName,
		icon: path.join(__dirname, './img/icons/icon'),
		appCopyright: CONFIG.copyright,
		asar: true,

		// Windows
		win32metadata: {
			CompanyName: CONFIG.companyName,
		},

		// macOS
		appBundleId: CONFIG.appleAppBundleId,
		darwinDarkModeSupport: true,
		// https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/LaunchServicesKeys.html#//apple_ref/doc/uid/TP40009250-SW8
		appCategoryType: 'public.app-category.business',
		extendInfo: path.join(__dirname, './resources/macos/entitlements.plist'),
		osxSign: hasMacosSign && {},
		osxNotarize: hasMacosSign && {
			appleId: process.env.APPLE_ID,
			appleIdPassword: process.env.APPLE_ID_PASSWORD,
			teamId: process.env.APPLE_TEAM_ID,
		},
	},

	makers: [
		// https://github.com/electron-userland/electron-wix-msi/
		// https://js.electronforge.io/interfaces/_electron_forge_maker_wix.MakerWixConfig.html
		// https://github.com/bitdisaster/Squirrel.Msi/
		// Prerequisites:
		// 1. winget install WiXToolset.WiXToolset
		// 2. Add C:\Program Files (x86)\WiX Toolset v3.14\bin\ to PATH
		CONFIG.windowsMsi && new MakerWix({
			appUserModelId: CONFIG.winAppId,
			description: CONFIG.description,
			exe: `${CONFIG.applicationName}.exe`,
			name: CONFIG.applicationName,
			icon: path.join(__dirname, 'img/icons/icon.ico'),
			manufacturer: CONFIG.companyName,
			shortName: CONFIG.applicationNameSanitized,
			arch: 'x64', // electron-wix-msi defaults to x86
			upgradeCode: CONFIG.winUpgradeCode,
			// Pass the version explicitly
			// otherwise MakerWix makes versions with prerelease tags invalid semantic version
			// which breaks app launch via stub executable
			// See: https://github.com/electron/forge/issues/3805
			version: packageJSON.version,
			ui: {
				images: {
					background: path.join(__dirname, 'img/wix-background.bmp'),
					banner: path.join(__dirname, 'img/wix-banner.bmp'),
				},
			},
			windowsSign: hasWindowsSign && signWithParamsToWindowsSignOptions(process.env.WINDOWS_SIGN_PARAMS),
			// A firewall exception must be added for the "C:/Program Files/Nextcloud Talk/app-version/Nextcloud Talk.exe".
			// Otherwise, a user is prompt to do it on the first call after every upgrade,
			// And it is only possible from an admin user
			// WiX Docs: https://docs.firegiant.com/wix3/xsd/firewall/firewallexception/
			// Unfortunately there is no way to specify the FirewallException via electron-wix-msi options
			// And there is no way to provide a custom MSICreator class to the @electron-forge/maker-wix
			// The only option is to override the instance method.
			// See also:
			// - https://github.com/electron-userland/electron-wix-msi/blob/master/src/creator.ts#L330
			// - https://js.electronforge.io/interfaces/_electron_forge_maker_wix.MakerWixConfig.html#beforeCreate
			// For testing (pwsh):
			// (Get-NetFirewallRule -DisplayName "Nextcloud Talk" | Get-NetFirewallApplicationFilter).Program
			extensions: ['WixFirewallExtension'],
			async beforeCreate(creator) {
				const originalCreateWxs = creator.createWxs.bind(creator)
				creator.createWxs = async function() {
					const wxs = await originalCreateWxs()

					const $ = cheerio.load(wxs.wxsContent, { xmlMode: true })

					$('Wix').attr('xmlns:firewall', 'http://schemas.microsoft.com/wix/FirewallExtension')

					// <Directory Name="app-{version}> -> <Component> -> <File Name="Nextcloud Talk.exe>
					// Represents: C:/Program Files/Nextcloud Talk/app-{version}/Nextcloud Talk.exe
					const $executableFile = $(`Directory[Name^="app-"] > Component > File[Name="${CONFIG.applicationName}.exe"]`)
					$('<firewall:FirewallException></firewall:FirewallException>').attr({
						Id: $executableFile.attr('Id') + '_firewall_exception',
						Name: CONFIG.applicationName,
						Description: CONFIG.description,
						Scope: 'any',
						IgnoreFailure: 'yes',
					}).appendTo($executableFile)

					// The file must be re-saved
					const wxsContent = $.xml()
					fs.writeFileSync(wxs.wxsFile, wxsContent, 'utf8')

					return {
						...wxs,
						wxsContent,
					}
				}
			},
		}),

		// https://github.com/squirrel/squirrel.windows
		// https://js.electronforge.io/interfaces/_electron_forge_maker_squirrel.InternalOptions.SquirrelWindowsOptions.html#setupExe
		CONFIG.windowsExe && new MakerSquirrel({
			// App/Filenames
			name: CONFIG.winSquirrelAppId,
			setupExe: generateDistName('win32', 'x64', '.exe'),
			setupMsi: generateDistName('win32', 'x64', '.msi'),
			exe: `${CONFIG.applicationName}.exe`,
			// Covered by WiX
			noMsi: true,

			// Meta
			title: CONFIG.applicationName,
			authors: CONFIG.companyName,
			owners: CONFIG.companyName,
			description: CONFIG.description,

			// Icons
			setupIcon: path.join(__dirname, './img/icons/icon.ico'),
			iconUrl: 'https://raw.githubusercontent.com/nextcloud/talk-desktop/refs/heads/main/img/icons/icon.ico',

			// Install/Update Loading
			loadingGif: path.join(__dirname, './img/squirrel-install-loading.gif'),

			// Signing
			signWithParams: hasWindowsSign && process.env.WINDOWS_SIGN_PARAMS,
		}),

		// https://js.electronforge.io/interfaces/_electron_forge_maker_dmg.MakerDMGConfig.html
		CONFIG.macosDmg && new MakerDMG({
			icon: path.join(__dirname, 'img/icons/icon.icns'),
			background: path.join(__dirname, 'img/dmg-background.png'),
			// https://github.com/LinusU/node-appdmg?tab=readme-ov-file#specification
			additionalDMGOptions: {
				// Background does not work when the title has spaces or special characters
				title: CONFIG.applicationNameSanitized,
			},
		}),

		// https://js.electronforge.io/classes/_electron_forge_maker_flatpak.MakerFlatpak-1.html
		CONFIG.linuxFlatpak && new MakerFlatpak({
			// https://js.electronforge.io/classes/_electron_forge_maker_flatpak.MakerFlatpak-1.html#config
			options: {
				id: CONFIG.linuxAppId,
				// The default binary name in flatpak builder is packageJSON.name while the actual binary name from packager is applicationName
				// Requires to be set explicitly
				bin: CONFIG.applicationName,
				productName: CONFIG.applicationName,
				description: CONFIG.description,
				genericName: 'Video and Chat Communication',
				branch: 'stable',
				// https://specifications.freedesktop.org/icon-theme-spec/latest/
				icon: {
					scalable: path.resolve(__dirname, 'img/talk-icon-rounded-spaced.svg'),
				},
				// https://specifications.freedesktop.org/menu-spec/latest/category-registry.html
				categories: [
					// Main Category
					'Network',
					// Additional Categories
					'InstantMessaging',
					'Chat',
					'VideoConference',
				],
				// Available versions: https://freedesktop-sdk.gitlab.io/documentation/updating-sdk/release-notes/
				runtimeVersion: '24.08',
				// Available versions: https://github.com/flathub/org.electronjs.Electron2.BaseApp/
				baseVersion: '24.08',
				// Based on https://github.com/malept/electron-installer-flatpak/blob/main/src/installer.js
				// Available versions: https://github.com/refi64/zypak/releases
				modules: [
					{
						name: 'zypak',
						sources: [
							{
								type: 'git',
								url: 'https://github.com/refi64/zypak',
								tag: 'v2024.01.17',
							},
						],
					},
				],
				finishArgs: [
					/**
					 * Default Electron args
					 * https://github.com/malept/electron-installer-flatpak/blob/main/src/installer.js
					 */

					// X Rendering
					'--socket=x11',
					'--share=ipc',
					// OpenGL
					'--device=dri',
					// Audio output
					'--socket=pulseaudio',
					// Read/write home directory access
					'--filesystem=home',
					// Chromium uses a socket in tmp for its singleton check
					'--env=TMPDIR=/var/tmp',
					// Allow communication with network
					'--share=network',
					// System notifications with libnotify
					'--talk-name=org.freedesktop.Notifications',
					// Ubuntu integration (dock badge counter - LauncherEntry)
					'--talk-name=com.canonical.Unity',

					/**
					 * Additional args
					 */

					// Enable webcam access
					'--device=all',
					// Enable screensharing access in Wayland
					'--socket=wayland',
				],
			},
		}),

		CONFIG.linuxZip && new MakerZIP({}, ['linux']),
	].filter(Boolean),

	plugins: [
		{
			name: '@electron-forge/plugin-webpack',
			config: {
				mainConfig: './webpack.main.config.js',
				devContentSecurityPolicy: `default-src 'self' 'unsafe-inline' data: blob: ${process.env.NEXTCLOUD_DEV_SERVER_HOSTS || '*'}; script-src 'self' 'unsafe-eval' 'unsafe-inline' data: blob:`,
				port: 3000, // The default for this plugin
				loggerPort: 9005, // The default is 9000, but it conflicts with Talk API
				devServer: {
					// Allow using app host
					allowedHosts: 'all',
					client: {
						overlay: false,
						// When serving a page from a custom host
						// WS hostname must be set explicitly
						webSocketURL: {
							hostname: 'localhost',
						},
					},
				},
				renderer: {
					config: './webpack.renderer.config.js',
					entryPoints: [
						{
							name: 'talk_desktop__window_welcome',
							html: './src/welcome/welcome.html',
							js: './src/welcome/welcome.js',
							preload: {
								js: './src/preload.js',
							},
						},
						{
							name: 'talk_desktop__window_authentication',
							html: './src/authentication/renderer/authentication.html',
							js: './src/authentication/renderer/authentication.main.js',
							preload: {
								js: './src/preload.js',
							},
						},
						{
							name: 'talk_desktop__window_talk',
							html: './src/talk/renderer/talk.html',
							js: './src/talk/renderer/talk.main.ts',
							preload: {
								js: './src/preload.js',
							},
						},
						{
							name: 'talk_desktop__window_help',
							html: './src/help/renderer/help.html',
							js: './src/help/renderer/help.app.js',
							preload: {
								js: './src/preload.js',
							},
						},
						{
							name: 'talk_desktop__window_upgrade',
							html: './src/upgrade/renderer/upgrade.html',
							js: './src/upgrade/renderer/upgrade.main.ts',
							preload: {
								js: './src/preload.js',
							},
						},
						{
							name: 'talk_desktop__window_callbox',
							html: './src/callbox/renderer/callbox.html',
							js: './src/callbox/renderer/callbox.main.ts',
							preload: {
								js: './src/preload.js',
							},
						},
						{
							name: 'talk_desktop__window_certificate',
							html: './src/certificate/renderer/certificate.html',
							js: './src/certificate/renderer/certificate.main.ts',
							preload: {
								js: './src/preload.js',
							},
						},
					],
				},
			},
		},
	],
}
