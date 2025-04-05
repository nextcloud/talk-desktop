/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const path = require('node:path')
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base.config.js')
const { resolveConfig } = require('./build/resolveBuildConfig.js')

module.exports = merge(baseConfig, {
	entry: path.resolve(__dirname, './src/main.js'),

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
				include: path.resolve(__dirname, './img/icons'),
				type: 'asset/resource',
			},
			// Chromium extension
			{
				test: /\.crx$/,
				include: path.resolve(__dirname, './resources'),
				type: 'asset/resource',
			},
		],
	},

	plugins: [
		new webpack.DefinePlugin({
			__BUILD_CONFIG__: JSON.stringify(resolveConfig()),
		}),
	],
})
