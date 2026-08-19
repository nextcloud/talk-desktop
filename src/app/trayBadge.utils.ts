/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
	type NativeImage,

	BrowserWindow, nativeImage,
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

	const displayText = count > 99 ? '99+' : String(count)
	const fontSize = count > 99 ? 11 : 16

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
					const badgeRadius = 11;
					const badgeCenterX = 32 - badgeRadius;
					const badgeCenterY = 32 - badgeRadius;
					
					// Draw badge background (red circle)
					ctx.beginPath();
					ctx.arc(badgeCenterX, badgeCenterY, badgeRadius, 0, 2 * Math.PI);
					ctx.fillStyle = '#E53935';
					ctx.fill();
					
					// Draw badge border
					ctx.strokeStyle = '#FFFFFF';
					ctx.lineWidth = 1;
					ctx.stroke();
					
					// Draw count text
					ctx.font = 'bold ${fontSize}px sans-serif';
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';
					ctx.fillStyle = '#FFFFFF';
					ctx.fillText('${displayText}', badgeCenterX, badgeCenterY + 1);
					
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
