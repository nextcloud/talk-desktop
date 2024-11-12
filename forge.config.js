/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const path = require('node:path')
const fs = require('node:fs')
const semver = require('semver')
const { MakerSquirrel } = require('@electron-forge/maker-squirrel')
const { MakerDMG } = require('@electron-forge/maker-dmg')
const { MakerFlatpak } = require('@electron-forge/maker-flatpak')
const { MakerZIP } = require('@electron-forge/maker-zip')
const packageJSON = require('./package.json')
const { MIN_REQUIRED_BUILT_IN_TALK_VERSION } = require('./src/constants.js')

require('dotenv').config()

const CONFIG = {
	// General
	applicationName: packageJSON.productName,
	applicationNameSanitized: packageJSON.productName.replaceAll(' ', '-'),
	companyName: 'Nextcloud GmbH',
	description: packageJSON.description,

	// macOS
	appleAppBundleId: 'com.nextcloud.talk.mac',
	// Windows
	winAppId: 'NextcloudTalk',
	// Linux
	linuxAppId: 'com.nextcloud.talk',
}

const YEAR = new Date().getFullYear()

const TALK_PATH = path.resolve(__dirname, process.env.TALK_PATH ?? 'spreed')
let talkPackageJson

module.exports = {
	hooks: {
		generateAssets() {
			if (!fs.existsSync(process.env.TALK_PATH)) {
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
				throw new Error(`No Nextcloud Talk (spreed repository) dependencies are installed.\nTry to execute \`cd ${TALK_PATH} && npm ci\``)
			}
		},

		postStart() {
			console.log(`Started with built-in Nextcloud Talk v${talkPackageJson.version} on path: ${TALK_PATH}`)
		},

		postPackage() {
			console.log(`Packaged with built-in Nextcloud Talk v${talkPackageJson.version} on path: ${TALK_PATH}`)
		},
	},

	// https://electron.github.io/packager/main/interfaces/Options.html
	packagerConfig: {
		// Common
		name: CONFIG.applicationName,
		icon: path.join(__dirname, './img/icons/icon'),
		appCopyright: `Copyright © ${YEAR} ${CONFIG.companyName}`,
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
	},

	makers: [
		// https://github.com/squirrel/squirrel.windows
		// https://js.electronforge.io/interfaces/_electron_forge_maker_squirrel.InternalOptions.SquirrelWindowsOptions.html#setupExe
		new MakerSquirrel({
			// App/Filenames
			name: CONFIG.winAppId,
			setupExe: `${CONFIG.applicationNameSanitized}-v${packageJSON.version}-win-x64.exe`,
			exe: `${CONFIG.applicationName}.exe`,

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
		}),

		// https://js.electronforge.io/interfaces/_electron_forge_maker_dmg.MakerDMGConfig.html
		new MakerDMG({
			icon: path.join(__dirname, 'img/icons/icon.icns'),
			background: path.join(__dirname, 'img/dmg-background.png'),
			// https://github.com/LinusU/node-appdmg?tab=readme-ov-file#specification
			additionalDMGOptions: {
				// Background does not work when the title has spaces or special characters
				title: 'NextcloudTalk',
			},
		}),

		// Linux
		new MakerFlatpak({
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
					scalable: path.resolve(__dirname, 'img/talk-icon-rounded.svg'),
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

		// Portable, all platforms
		new MakerZIP(),
	],

	plugins: [
		{
			name: '@electron-forge/plugin-webpack',
			config: {
				mainConfig: './webpack.main.config.js',
				devContentSecurityPolicy: `default-src 'self' 'unsafe-inline' data: blob: ${process.env.NEXTCLOUD_DEV_SERVER_HOSTS}; script-src 'self' 'unsafe-eval' 'unsafe-inline' data: blob:`,
				port: 3000, // The default for this plugin
				loggerPort: 9005, // The default is 9000, but it conflicts with Talk API
				devServer: {
					client: {
						overlay: false,
					},
				},
				renderer: {
					config: './webpack.renderer.config.js',
					entryPoints: [
						{
							name: 'welcome_window',
							html: './src/welcome/welcome.html',
							js: './src/welcome/welcome.js',
							preload: {
								js: './src/preload.js',
							},
						},
						{
							name: 'authentication_window',
							html: './src/authentication/renderer/authentication.html',
							js: './src/authentication/renderer/authentication.main.js',
							preload: {
								js: './src/preload.js',
							},
						},
						{
							name: 'talk_window',
							html: './src/talk/renderer/talk.html',
							js: './src/talk/renderer/talk.main.js',
							preload: {
								js: './src/preload.js',
							},
						},
						{
							name: 'help_window',
							html: './src/help/renderer/help.html',
							js: './src/help/renderer/help.app.js',
							preload: {
								js: './src/preload.js',
							},
						},
						{
							name: 'upgrade_window',
							html: './src/upgrade/renderer/upgrade.html',
							js: './src/upgrade/renderer/upgrade.app.js',
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
