/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

require('dotenv').config()

const { EsbuildPlugin } = require('esbuild-loader')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const { spawnSync } = require('node:child_process')
const path = require('node:path')
const { VueLoaderPlugin } = require('vue-loader')
const webpack = require('webpack')
const { resolveConfig } = require('./build/resolveBuildConfig.js')
const { getAppInfo } = require('./scripts/utils/appinfo.utils.cjs')

const TALK_PATH = path.resolve(__dirname, process.env.TALK_PATH ?? 'spreed')
const CHANNEL = process.env.CHANNEL ?? 'dev'

const MAX_NEXTCLOUD_VERSION = getAppInfo(TALK_PATH).maxVersion
const NEXTCLOUD_MASTER_VERSION = 33

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
	} catch {
		// Ignore
	}

	let desktopModulePath = false
	try {
		desktopModulePath = require.resolve(packageName)
	} catch {
		// Ignore
	}

	// webpack.resolve.aliases
	return {
		[`${packageName}$`]: path.resolve(__dirname, `src/patchers/${packageName}.js`),
		[`@talk-modules--${packageName}$`]: talkModulePath,
		[`@desktop-modules--${packageName}$`]: desktopModulePath,
	}
}

/**
 * Get the full version, including commit hash and branch name if not tagged
 *
 * @example "v1.0.0-rc.2" on a directly tagged (released) commit
 * @example "v1.0.0-rc.2-481b5e1 (fix/diagnosis-report-versions)" on an untagged commit
 * @param {string} cwd - The path to the git repository
 * @return {string} - The described version
 */
function getFullVersion(cwd = __dirname) {
	// Currently specified version from the package.json, e.g. "21.0.0-dev.0"
	const packageVersion = require(`${cwd}/package.json`).version

	if (CHANNEL === 'stable') {
		return `v${packageVersion}`
	}

	// Current commit tag if any or an empty string, e.g. "v21.0.0-dev.0"
	// Only when the repository is directly on the released (tagged) commit
	const gitVersion = spawnSync('git', ['tag', '--points-at', 'HEAD'], { cwd }).stdout.toString().trim()
	if (gitVersion) {
		if (gitVersion !== `v${packageVersion}`) {
			throw new Error(`Git tag version "${gitVersion}" is different from the package version "${packageVersion}". Likely release process went wrong...`)
		}
		// Dev channel build directly on the released (tagged) commit
		return gitVersion
	}

	// Commit hash, e.g. "85d5a6722"
	const hash = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd }).stdout.toString().trim()
	// Branch name, e.g. "fix/diagnosis-report-versions" or "HEAD" if detached
	const branch = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd }).stdout.toString().trim()

	return `v${packageVersion}-${hash} (${branch})`
}

const appName = process.env.npm_package_name
const appVersion = process.env.npm_package_version

const cssLoaderWithModules = {
	loader: 'css-loader',
	options: {
		modules: {
			namedExport: false,
			// Same as in Vite
			localIdentName: '_[local]_[hash:base64:5]',
			exportLocalsConvention: 'asIs',
		},
	},
}

const webpackRendererConfig = {
	output: {
		assetModuleFilename: 'talk_desktop__dist/assets/[name][ext]?v=[contenthash]',
		chunkFilename: 'talk_desktop__dist/chunks/[name].js?v=[contenthash]',
	},

	module: {
		rules: [
			// @nextcloud/webpack-vue-config default rules
			{
				test: /\.vue$/,
				loader: 'vue-loader',
			},
			{
				test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf)$/,
				type: 'asset/inline',
			},
			// Talk specific rules
			{
				test: /\.wasm$/i,
				type: 'asset/resource',
			},
			{
				test: /\.tflite$/i,
				type: 'asset/resource',
			},
			{
				resourceQuery: /raw/,
				type: 'asset/source',
			},
			// Talk Desktop specific rules
			{
				test: /\.css$/,
				oneOf: [{
					resourceQuery: /module/,
					use: [MiniCssExtractPlugin.loader, cssLoaderWithModules, 'sass-loader'],
				}, {
					use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
				}],
			},
			{
				test: /\.scss$/,
				oneOf: [{
					resourceQuery: /module/,
					use: [MiniCssExtractPlugin.loader, cssLoaderWithModules, 'sass-loader'],
				}, {
					use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
				}],
			},
			{
				test: /\.(js|mjs)$/,
				loader: 'esbuild-loader',
				options: {
					loader: 'js',
					// With Electron, we can use the most modern features
					// But with web client - we cannot
					// Replace target to support Top-level await
					target: 'es2022',
				},
			},
			{
				test: /\.tsx?$/,
				use: {
					loader: 'esbuild-loader',
					options: {
						// Implicitly set as TS loader so only <script lang="ts"> Vue SFCs will be transpiled
						loader: 'ts',
						target: 'es2022',
					},
				},
			},
			{
				test: /\.worker\.js$/,
				use: {
					loader: 'worker-loader',
					options: {
						// Some workers load .wasm resources by relative path, ignoring the bundler
						// So workers and wasm must be in the same directory
						filename: 'talk_desktop__dist/assets/[name].js?v=[contenthash]',
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
			'@global-styles': path.resolve(__dirname, 'resources/server-global-styles', MAX_NEXTCLOUD_VERSION >= NEXTCLOUD_MASTER_VERSION ? 'master' : `stable${MAX_NEXTCLOUD_VERSION}`),
			// To reuse modules between Talk Desktop and Talk, otherwise Talk has its own from its node_modules
			'@nextcloud/axios': path.resolve(__dirname, 'node_modules', '@nextcloud/axios/dist/index.mjs'),
			// Patched packages
			...createPatcherAliases('@nextcloud/router'),
		},
	},

	optimization: {
		minimizer: [
			new EsbuildPlugin({
				target: 'es2022',
				// Those files have global variable defined via `var` in non module scope used later in other modules,
				// Which is broken by any minification
				exclude: [
					/\/vision_wasm_internal\.js/,
					/\/vision_wasm_nosimd_internal\.js/,
				],
			}),
		],
	},

	plugins: [
		new VueLoaderPlugin(),

		// Make sure we auto-inject node polyfills on demand
		// https://webpack.js.org/blog/2020-10-10-webpack-5-release/#automatic-nodejs-polyfills-removed
		new NodePolyfillPlugin({
			additionalAliases: ['process'],
		}),

		new webpack.DefinePlugin({
			// Common @nextcloud/webpack-vue-config
			appName: JSON.stringify(appName),
			appVersion: JSON.stringify(appVersion),
			// Vue compile time flags
			// See: https://vuejs.org/api/compile-time-flags.html#compile-time-flags
			// See: https://github.com/vuejs/core/blob/v3.5.24/packages/vue/README.md#bundler-build-feature-flags
			// > The build will work without configuring these flags,
			// > however it is strongly recommended to properly configure them in order to get proper tree-shaking in the final bundle
			// Unlike Vite plugin, vue-loader does not do this automatically for Webpack
			// Although documentation says, it is optional, sometimes it breaks with:
			// ReferenceError: __VUE_PROD_DEVTOOLS__ is not defined
			__VUE_OPTIONS_API__: true,
			__VUE_PROD_DEVTOOLS__: true,
			__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
			// Talk Desktop built-time constants
			IS_DESKTOP: true,
			__IS_DESKTOP__: true,
			__CHANNEL__: JSON.stringify(CHANNEL),
			__VERSION_TAG__: JSON.stringify(getFullVersion()),
			__TALK_VERSION_TAG__: JSON.stringify(getFullVersion(TALK_PATH)),
			'process.env.NEXTCLOUD_DEV_SERVER_HOSTS': JSON.stringify(process.env.NEXTCLOUD_DEV_SERVER_HOSTS),
			__BUILD_CONFIG__: JSON.stringify(resolveConfig()),
		}),

		new MiniCssExtractPlugin({
			filename: 'talk_desktop__dist/assets/[name].css',
			chunkFilename: 'talk_desktop__dist/chunks/[name].css',
			ignoreOrder: true,
		}),
	],
}

module.exports = webpackRendererConfig
