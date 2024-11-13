/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
	const originalPlainLightPath = path.join(__dirname, '../img/talk-icon-plain-light.svg')
	const originalPlainDarkPath = path.join(__dirname, '../img/talk-icon-plain-dark.svg')
	const outputPath = path.join(__dirname, '../img/icons')

	await icongen(originalPath, outputPath, {
		// Windows
		ico: {
			name: 'icon',
			sizes: [16, 24, 32, 48, 256],
		},
		// Linux + Mac (PNG)
		favicon: {
			name: 'icon',
			pngSizes: [16, 32, 512],
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

	// Tray icon - Mac
	await icongen(originalPlainLightPath, outputPath, {
		favicon: {
			name: 'IconTrayMacTemplate',
			pngSizes: [16, 32],
		},
	})

	// Tray icon - Linux
	await icongen(originalPlainLightPath, outputPath, {
		favicon: {
			name: 'icon-tray-linux-light',
			pngSizes: [16, 32],
		},
	})
	await icongen(originalPlainDarkPath, outputPath, {
		favicon: {
			name: 'icon-tray-linux-dark',
			pngSizes: [16, 32],
		},
	})

	// Tray icon - Windows monochrome
	await icongen(originalPlainLightPath, outputPath, {
		ico: {
			name: 'icon-tray-win32-light',
			sizes: [16, 24, 32, 48, 256],
		},
	})
	await icongen(originalPlainDarkPath, outputPath, {
		ico: {
			name: 'icon-tray-win32-dark',
			sizes: [16, 24, 32, 48, 256],
		},
	})

	// Rename icon512.png -> icon.png
	await fs.rename(path.join(outputPath, 'icon512.png'), path.join(outputPath, 'icon.png'))
	// Rename icon16.png -> icon-tray-mac.png
	// Rename icon32.png -> icon-tray-linux.png + icon-tray-mac@2x.png
	await fs.cp(path.join(outputPath, 'icon32.png'), path.join(outputPath, 'icon-tray-linux.png'))
	await fs.cp(path.join(outputPath, 'icon16.png'), path.join(outputPath, 'icon-tray-mac.png'))
	await fs.cp(path.join(outputPath, 'icon32.png'), path.join(outputPath, 'icon-tray-mac@2x.png'))

	// Remove unused favicon
	await fs.unlink(path.join(outputPath, 'favicon.ico'))
	await fs.unlink(path.join(outputPath, 'icon16.png'))
	await fs.unlink(path.join(outputPath, 'icon32.png'))

	// Rename IconTrayMacTemplate16.png -> IconTrayMacTemplate.png, IconTrayMacTemplate32.png -> IconTrayMacTemplate@2x.png
	await fs.rename(path.join(outputPath, 'IconTrayMacTemplate16.png'), path.join(outputPath, 'IconTrayMacTemplate.png'))
	await fs.rename(path.join(outputPath, 'IconTrayMacTemplate32.png'), path.join(outputPath, 'IconTrayMacTemplate@2x.png'))

	// Rename icon-tray-linux-(light|dark)16.png -> icon-tray-linux-(light|dark).png, icon-tray-linux-(light|dark)32.png -> icon-tray-linux-(light|dark)@2x.png
	await fs.rename(path.join(outputPath, 'icon-tray-linux-light16.png'), path.join(outputPath, 'icon-tray-linux-light.png'))
	await fs.rename(path.join(outputPath, 'icon-tray-linux-light32.png'), path.join(outputPath, 'icon-tray-linux-light@2x.png'))
	await fs.rename(path.join(outputPath, 'icon-tray-linux-dark16.png'), path.join(outputPath, 'icon-tray-linux-dark.png'))
	await fs.rename(path.join(outputPath, 'icon-tray-linux-dark32.png'), path.join(outputPath, 'icon-tray-linux-dark@2x.png'))
}

generateIcons()
	.then(() => console.log('✅ Done'))
	.catch((err) => console.error(err))
