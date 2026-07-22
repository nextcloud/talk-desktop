/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import path from 'node:path'
import webpack from 'webpack'
import { merge } from 'webpack-merge'
import { resolveBuildConfig } from './build/resolveBuildConfig.js'
import baseConfig from './webpack.base.config.js'

export default merge(baseConfig, {
	entry: path.resolve(import.meta.dirname, './src/main.js'),

	output: {
		assetModuleFilename: '[file]',
	},

	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'esbuild-loader',
				options: {
					target: 'es2022',
				},
			},
			{
				test: /\.(png|ico|icns)$/,
				include: path.resolve(import.meta.dirname, './img/icons'),
				type: 'asset/resource',
			},
			{
				test: /\.node$/,
				type: 'asset/resource',
			},
			// Chromium extension
			{
				test: /\.crx$/,
				include: path.resolve(import.meta.dirname, './resources'),
				type: 'asset/resource',
			},
		],
	},

	plugins: [
		new webpack.DefinePlugin({
			__BUILD_CONFIG__: JSON.stringify(resolveBuildConfig()),
		}),
	],
})
