/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

require('dotenv').config()

const path = require('node:path')
const { spawnSync } = require('node:child_process')
const webpack = require('webpack')
const { mergeWithRules } = require('webpack-merge')

const TALK_PATH = path.resolve(__dirname, process.env.TALK_PATH ?? 'spreed')

/**
 * appName and appVersion constants are set by process.env.npm_package_* in @nextcloud/webpack-vue-config.
 * During build in this project, env variables will be different and constants will be incorrect.
 * To keep values correct - set implicitly.
 */
const talkPackage = require(`${TALK_PATH}/package.json`)
process.env.npm_package_name = talkPackage.name
process.env.npm_package_version = talkPackage.version

const nextcloudWebpackConfig = require('@nextcloud/webpack-vue-config')
const commonTalkWebpackConfig = require(`${TALK_PATH}/webpack.common.config`)
const { getAppInfo } = require('./scripts/utils/appinfo.utils.cjs')

const MAX_NEXTCLOUD_VERSION = getAppInfo(TALK_PATH).maxVersion
const NEXTCLOUD_MASTER_VERSION = 31

/**
 * Create webpack aliases config to patch a package
 *
 * @param {string} packageName - name of the package to patch, for example, @nextcloud/axios
 * @return {Record<string, string>} webpack.resolve.alice config object with at most 3 aliases:
 *                                  - Alias from package to the patcher (e.g. @nextcloud/axios)
 *                                  - Alias to the original module in spreed (e.g. @talk-modules--@nextcloud/axios)
 *                                  - Alias to the original module in talk-desktop (e.g. @desktop-modules--@nextcloud/axios)
 */
function createPatcherAliases(packageName) {
	// Try to resolve a package. If it throws then there is no such package, do not create an alias
	let talkModulePath = false
	try {
		talkModulePath = require.resolve(packageName, { paths: [TALK_PATH] })
	} catch {}

	let desktopModulePath = false
	try {
		desktopModulePath = require.resolve(packageName)
	} catch {}

	// webpack.resolve.aliases
	return {
		[`${packageName}$`]: path.resolve(__dirname, `src/patchers/${packageName}.js`),
		[`@talk-modules--${packageName}$`]: talkModulePath,
		[`@desktop-modules--${packageName}$`]: desktopModulePath,
	}
}

/**
 * Get the version tag via "git describe".
 * @example "v1.0.1" on a directly tagged commit
 * @example "v1.0.1-80-g481b5e1 (heads/fix/help-system-report)" on an untagged commit
 * @param {string} cwd - The path to the git repository
 * @return {string} - The described version
 */
function getDescribedVersion(cwd = __dirname) {
	const gitTag = spawnSync('git', ['describe', '--tags'], { cwd }).stdout.toString().trim()
	const gitBranch = spawnSync('git', ['describe', '--all'], { cwd }).stdout.toString().trim()
	if (!gitBranch.startsWith('tags/')) {
		return `${gitTag} (${gitBranch})`
	}
	return gitTag
}

const webpackRendererConfig = mergeWithRules({
	module: {
		rules: {
			test: 'match',
			use: 'merge',
			loader: 'replace',
			options: 'replace',
		},
	},
})(commonTalkWebpackConfig, {
	output: {
		assetModuleFilename: '[name][ext]?v=[contenthash]',
	},

	module: {
		rules: [
			/**
			 * With Electron we can use the most modern features,
			 * But with web client - we cannot.
			 * Replace target to support Top-level await
			 */
			{
				test: /\.js$/,
				loader: 'esbuild-loader',
				options: {
					loader: 'js',
					target: 'es2022',
				},
			},
			{
				test: /\.worker\.js$/,
				use: {
					loader: 'worker-loader',
					options: {
						/**
						 * By default, webpack loads async js to new sub-folder, same as new entrypoint.
						 * It brakes loading wasm resources from talk's Web Worker, expecting it to be in the same path.
						 * To fix - load worker the same way as asset/resources - to the root.
						 */
						filename: '[name].js?v=[contenthash]',
					},
				},
			},
			{
				test: /\.ogg$/,
				type: 'asset/resource',
			},
		],
	},

	resolve: {
		alias: {
			'@talk': TALK_PATH,
			'@global-styles': path.resolve(__dirname, 'resources/server-global-styles', MAX_NEXTCLOUD_VERSION === NEXTCLOUD_MASTER_VERSION ? 'master' : `stable${MAX_NEXTCLOUD_VERSION}`),
			// To reuse modules between Talk Desktop and Talk, otherwise Talk has its own from its node_modules
			'@nextcloud/axios': path.resolve(__dirname, 'node_modules', '@nextcloud/axios/dist/index.mjs'),
			// Patched packages
			...createPatcherAliases('@nextcloud/router'),
		},
	},

	plugins: [
		// TODO: Figure out, why plugins (VueLoaderPlugin) cannot be reused in spreed/webpack.common.config.js
		...nextcloudWebpackConfig.plugins,

		new webpack.DefinePlugin({
			IS_DESKTOP: true,
			__VERSION_TAG__: JSON.stringify(getDescribedVersion()),
			__TALK_VERSION_TAG__: JSON.stringify(getDescribedVersion(TALK_PATH)),
			'process.env.NEXTCLOUD_DEV_SERVER_HOSTS': JSON.stringify(process.env.NEXTCLOUD_DEV_SERVER_HOSTS),
		}),
	],
})

module.exports = webpackRendererConfig
