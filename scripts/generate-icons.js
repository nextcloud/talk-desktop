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
			name: 'IconTrayLinuxLight',
			pngSizes: [16, 32],
		},
	})
	await icongen(originalPlainDarkPath, outputPath, {
		favicon: {
			name: 'IconTrayLinuxDark',
			pngSizes: [16, 32],
		},
	})

	// Tray icon - Windows monochrome
	await icongen(originalPlainLightPath, outputPath, {
		ico: {
			name: 'IconTrayWin32Light',
			sizes: [16, 24, 32, 48, 256],
		},
	})
	await icongen(originalPlainDarkPath, outputPath, {
		ico: {
			name: 'IconTrayWin32Dark',
			sizes: [16, 24, 32, 48, 256],
		},
	})

	// Rename icon512.png -> icon.png
	await fs.rename(path.join(outputPath, 'icon512.png'), path.join(outputPath, 'icon.png'))
	// Rename icon16.png -> IconTrayMac.png
	// Rename icon32.png -> IconTrayLinux.png + IconTrayMac@2x.png
	await fs.cp(path.join(outputPath, 'icon32.png'), path.join(outputPath, 'IconTrayLinux.png'))
	await fs.cp(path.join(outputPath, 'icon16.png'), path.join(outputPath, 'IconTrayMac.png'))
	await fs.cp(path.join(outputPath, 'icon32.png'), path.join(outputPath, 'IconTrayMac@2x.png'))

	// Remove unused favicon
	await fs.unlink(path.join(outputPath, 'favicon.ico'))
	await fs.unlink(path.join(outputPath, 'icon16.png'))
	await fs.unlink(path.join(outputPath, 'icon32.png'))

	// Rename IconTrayMacTemplate16.png -> IconTrayMacTemplate.png, IconTrayMacTemplate32.png -> IconTrayMacTemplate@2x.png
	await fs.rename(path.join(outputPath, 'IconTrayMacTemplate16.png'), path.join(outputPath, 'IconTrayMacTemplate.png'))
	await fs.rename(path.join(outputPath, 'IconTrayMacTemplate32.png'), path.join(outputPath, 'IconTrayMacTemplate@2x.png'))

	// Rename IconTrayLinux(Light|Dark)16.png -> IconTrayLinux(Light|Dark).png, IconTrayLinux(Light|Dark)32.png -> IconTrayLinux(Light|Dark)@2x.png
	await fs.rename(path.join(outputPath, 'IconTrayLinuxLight16.png'), path.join(outputPath, 'IconTrayLinuxLight.png'))
	await fs.rename(path.join(outputPath, 'IconTrayLinuxLight32.png'), path.join(outputPath, 'IconTrayLinuxLight@2x.png'))
	await fs.rename(path.join(outputPath, 'IconTrayLinuxDark16.png'), path.join(outputPath, 'IconTrayLinuxDark.png'))
	await fs.rename(path.join(outputPath, 'IconTrayLinuxDark32.png'), path.join(outputPath, 'IconTrayLinuxDark@2x.png'))
}

generateIcons()
	.then(() => console.log('✅ Done'))
	.catch((err) => console.error(err))
