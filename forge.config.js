/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const path = require('node:path')
const fs = require('node:fs')
const semver = require('semver')
const { MIN_REQUIRED_BUILT_IN_TALK_VERSION } = require('./src/constants.js')

require('dotenv').config()

const TALK_PATH = path.resolve(__dirname, process.env.TALK_PATH ?? 'spreed')
let talkPackageJson

module.exports = {
	packagerConfig: {
		icon: './img/icons/icon',
	},

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
		},

		postStart() {
			console.log(`Started with built-in Nextcloud Talk v${talkPackageJson.version} on path: ${TALK_PATH}`)
		},

		postPackage() {
			console.log(`Packaged with built-in Nextcloud Talk v${talkPackageJson.version} on path: ${TALK_PATH}`)
		},
	},

	rebuildConfig: {},

	makers: [
		// {
		// 	name: '@electron-forge/maker-squirrel',
		// 	config: {},
		// },
		{
			name: '@electron-forge/maker-zip',
			// platforms: ['darwin'],
		},
		// {
		// 	name: '@electron-forge/maker-deb',
		// 	config: {},
		// },
		// {
		// 	name: '@electron-forge/maker-rpm',
		// 	config: {},
		// },
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
