/*
 * @copyright Copyright (c) 2023 Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
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

const path = require('node:path')
const fs = require('node:fs/promises')
const icongen = require('icon-gen')

/**
 * Generate all icons from original SVGs
 *
 * @return {Promise<void>}
 */
async function generateIcons() {
	const originalPath = path.join(__dirname, '../img/talk-icon-rounded.svg')
	const originalMacPath = path.join(__dirname, '../img/talk-icon-mac-shadow.svg')
	const outputPath = path.join(__dirname, '../img/icons')

	await icongen(originalPath, outputPath, {
		// Windows
		ico: {
			name: 'icon',
			sizes: [16, 24, 32, 48, 256],
		},
		// Linux (PNG)
		favicon: {
			name: 'icon',
			pngSizes: [512],
			icoSizes: [],
		},
	})

	await icongen(originalMacPath, outputPath, {
		// Mac
		icns: {
			name: 'icon',
			sizes: [16, 32, 64, 128, 256, 512, 1024],
		},
	})

	// Rename icon512.png -> icon.png
	await fs.rename(path.join(outputPath, 'icon512.png'), path.join(outputPath, 'icon.png'))

	// Remove unused favicon
	await fs.unlink(path.join(outputPath, 'favicon.ico'))
}

generateIcons()
	.then(() => console.log('✅ Done'))
	.catch((err) => console.error(err))
