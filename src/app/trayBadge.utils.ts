/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { NativeImage } from 'electron'

import {
	BrowserWindow,
	nativeImage,
} from 'electron'
import fs from 'node:fs'

// Cache for the base icon data
let cachedBaseIconPath: string | null = null
let cachedBaseIconDataUrl: string | null = null

/**
 * Create a tray icon with a badge overlay showing the unread count
 *
 * @param baseIconPath - Path to the base tray icon
 * @param count - Number to display in the badge (0 to hide badge)
 * @return NativeImage with badge overlay, or the original icon if count is 0
 */
export async function createTrayIconWithBadge(baseIconPath: string, count: number): Promise<NativeImage> {
	// If no unread messages, return the base icon
	if (count <= 0) {
		return nativeImage.createFromPath(baseIconPath)
	}

	// Read and cache the base icon as data URL
	if (cachedBaseIconPath !== baseIconPath || !cachedBaseIconDataUrl) {
		cachedBaseIconPath = baseIconPath
		const buffer = fs.readFileSync(baseIconPath)
		cachedBaseIconDataUrl = `data:image/png;base64,${buffer.toString('base64')}`
	}

	// Create invisible window for rendering
	const win = new BrowserWindow({
		width: 64,
		height: 64,
		show: false,
		frame: false,
		transparent: true,
		webPreferences: {
			offscreen: true,
			nodeIntegration: false,
			contextIsolation: true,
		},
	})

	// On macOS the tray icon is a template image: a black silhouette with an alpha
	// channel that the system tints to match the menu bar. To stay a template, the
	// badge must not introduce any color - it is drawn as an opaque shape with the
	// count punched out, separated from the icon by a transparent ring.
	// Electron recognises template images by the "Template" filename suffix.
	const isTemplateIcon = baseIconPath.includes('Template')

	const displayText = count > 99 ? '99+' : String(count)
	// macOS renders the icon at 16x16 points, where a badge as large as on Linux
	// and Windows would cover too much of the silhouette
	const badgeRadius = isTemplateIcon ? 9 : 11
	const fontSize = isTemplateIcon
		? (count > 99 ? 9 : 13)
		: (count > 99 ? 11 : 16)

	// Generate HTML with canvas to draw the icon + badge
	const html = `
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				* { margin: 0; padding: 0; }
				body { background: transparent; }
				canvas { display: block; }
			</style>
		</head>
		<body>
			<canvas id="canvas" width="32" height="32"></canvas>
			<script>
				const canvas = document.getElementById('canvas');
				const ctx = canvas.getContext('2d');
				const img = new Image();
				img.onload = () => {
					// Draw base icon
					ctx.drawImage(img, 0, 0, 32, 32);
					
					// Badge dimensions
					const badgeRadius = ${badgeRadius};
					const badgeCenterX = 32 - badgeRadius;
					const badgeCenterY = 32 - badgeRadius;

					ctx.font = 'bold ${fontSize}px sans-serif';
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';

					if (${isTemplateIcon}) {
						// Template image: monochrome only, the system tints it.
						// Punch a transparent ring so the badge stays visually separate
						// from the icon once both are tinted the same color.
						ctx.globalCompositeOperation = 'destination-out';
						ctx.beginPath();
						ctx.arc(badgeCenterX, badgeCenterY, badgeRadius + 1.5, 0, 2 * Math.PI);
						ctx.fill();

						// Opaque badge disc
						ctx.globalCompositeOperation = 'source-over';
						ctx.beginPath();
						ctx.arc(badgeCenterX, badgeCenterY, badgeRadius, 0, 2 * Math.PI);
						ctx.fillStyle = '#000000';
						ctx.fill();

						// Punch out the count, so it shows through as the menu bar background
						ctx.globalCompositeOperation = 'destination-out';
						ctx.fillText('${displayText}', badgeCenterX, badgeCenterY + 1);
						ctx.globalCompositeOperation = 'source-over';
					} else {
						// Colored badge for Windows and Linux
						ctx.beginPath();
						ctx.arc(badgeCenterX, badgeCenterY, badgeRadius, 0, 2 * Math.PI);
						ctx.fillStyle = '#E53935';
						ctx.fill();

						ctx.strokeStyle = '#FFFFFF';
						ctx.lineWidth = 1;
						ctx.stroke();

						ctx.fillStyle = '#FFFFFF';
						ctx.fillText('${displayText}', badgeCenterX, badgeCenterY + 1);
					}
					
					// Signal rendering complete
					window.renderComplete = true;
				};
				img.src = '${cachedBaseIconDataUrl}';
			</script>
		</body>
		</html>
	`

	try {
		await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)

		// Wait for rendering to complete
		await new Promise<void>((resolve) => {
			const checkComplete = async () => {
				const complete = await win.webContents.executeJavaScript('window.renderComplete')
				if (complete) {
					resolve()
				} else {
					setTimeout(checkComplete, 10)
				}
			}
			setTimeout(checkComplete, 50)
		})

		// Capture the canvas content
		const image = await win.webContents.capturePage({
			x: 0,
			y: 0,
			width: 32,
			height: 32,
		})

		if (isTemplateIcon) {
			// The canvas renders 32x32 pixels, but a macOS menu bar icon is 16x16
			// points (32x32 only as its @2x representation). Returning the bitmap
			// as-is would make it a 32 point icon - twice the size of the original.
			// Registering it as the @2x representation keeps the size correct and
			// stays sharp on retina displays.
			const scaledImage = nativeImage.createEmpty()
			scaledImage.addRepresentation({
				scaleFactor: 2,
				width: 16,
				height: 16,
				dataURL: image.toDataURL(),
			})
			// A captured image is not a template image by default - mark it explicitly,
			// otherwise macOS would draw the black silhouette as-is instead of tinting it
			scaledImage.setTemplateImage(true)

			win.destroy()
			return scaledImage
		}

		win.destroy()
		return image
	} catch (error) {
		console.error('Error creating badge icon:', error)
		win.destroy()
		return nativeImage.createFromPath(baseIconPath)
	}
}

/**
 * Clear the cached base icon (useful when theme changes)
 */
export function clearTrayIconCache(): void {
	cachedBaseIconPath = null
	cachedBaseIconDataUrl = null
}
