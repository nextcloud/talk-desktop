/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
const { DefinePlugin } = require('webpack')

const CHANNEL = process.env.CHANNEL ?? 'dev'

module.exports = {
	module: {
		rules: [
			{
				test: /native_modules[/\\].+\.node$/,
				use: 'node-loader',
			},
			{
				test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
				parser: { amd: false },
				use: {
					loader: '@vercel/webpack-asset-relocator-loader',
					options: {
						outputAssetBase: 'native_modules',
					},
				},
			},
		],
	},

	plugins: [
		new DefinePlugin({
			__CHANNEL__: JSON.stringify(CHANNEL),
		}),
	],
}
