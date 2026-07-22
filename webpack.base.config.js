/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import webpack from 'webpack'

const CHANNEL = process.env.CHANNEL ?? 'dev'

export default {
	plugins: [
		new webpack.DefinePlugin({
			__CHANNEL__: JSON.stringify(CHANNEL),
		}),
	],
}
