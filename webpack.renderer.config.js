/*
 * @copyright Copyright (c) 2022 Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
 *
 * @author Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

require('dotenv').config()

const path = require('node:path')
const fs = require('node:fs')
const webpack = require('webpack')
const { mergeWithRules } = require('webpack-merge')
const nextcloudWebpackConfig = require('@nextcloud/webpack-vue-config')

const TALK_PATH = path.resolve(__dirname, process.env.TALK_PATH ?? 'spreed')
if (!fs.existsSync(process.env.TALK_PATH)) {
	throw new Error(`TALK_PATH path is not correct: ${path.resolve(TALK_PATH)}`)
}
console.log(`Using Talk on path: ${path.resolve(TALK_PATH)}`)

const commonTalkWebpackConfig = require(`${TALK_PATH}/webpack.common.config`)

const merge = mergeWithRules({
	module: {
		rules: {
			test: 'match',
			use: 'merge',
		},
	},
})

/** @type {import('webpack').Configuration} */
module.exports = merge(commonTalkWebpackConfig, {
	output: {
		assetModuleFilename: '[name][ext]?v=[contenthash]',
	},

	module: {
		rules: [
			{
				test: /\.worker\.js$/,
				use: {
					loader: 'worker-loader',
					options: {
						// By default, electron-forge/webpack loads workers to new sub-folder, same as new entrypoint.
						// It brakes loading wasm resources from talk's Web Worker, expecting it to be in the same path.
						// Fix: load worker the same way as asset/resources - to root.
						filename: '[name].js?v=[contenthash]',
					},
				},
			},
		],
	},

	resolve: {
		alias: {
			'talk': TALK_PATH,
			'@nextcloud/initial-state$': path.resolve(__dirname, 'src/stubs/nextcloud-initial-state.js'),
			'@nextcloud/axios$': path.resolve(__dirname, 'src/stubs/nextcloud-axios.js'),
			'@nextcloud/router$': path.resolve(__dirname, 'src/stubs/nextcloud-router.js'),
			'@nextcloud/auth$': path.resolve(__dirname, 'src/stubs/nextcloud-auth.js'),
			// TODO: get path from require(), not hard coded ?
			'@nextcloud/l10n': path.resolve(__dirname, 'node_modules/@nextcloud/l10n'),
		},
	},

	plugins: [
		// TODO: Figure out, why plugins (VueLoaderPlugin) cannot be reused in spreed/webpack.common.config.js
		...nextcloudWebpackConfig.plugins,

		new webpack.ProvidePlugin({
			OC: [path.join(path.resolve(__dirname), './src/stubs/globals.js'), 'OC'],
			'window.OC': [path.join(path.resolve(__dirname), './src/stubs/globals.js'), 'OC'],
			OCA: [path.join(path.resolve(__dirname), './src/stubs/globals.js'), 'OCA'],
			'window.OCA': [path.join(path.resolve(__dirname), './src/stubs/globals.js'), 'OCA'],
			OCP: [path.join(path.resolve(__dirname), './src/stubs/globals.js'), 'OCP'],
			'window.OCP': [path.join(path.resolve(__dirname), './src/stubs/globals.js'), 'OCP'],
			t: ['@nextcloud/l10n', 'translate'],
		}),

		new webpack.DefinePlugin({ IS_TALK_DESKTOP: true }),
	],
})
