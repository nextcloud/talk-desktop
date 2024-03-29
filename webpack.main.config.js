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

const path = require('path')
const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base.config.js')

module.exports = merge(baseConfig, {
	entry: path.resolve(__dirname, './src/main.js'),

	output: {
		assetModuleFilename: '[file]',
	},

	module: {
		rules: [
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
})
