/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getBuilder } from '@nextcloud/browser-storage'

/**
 * Cool down time after the last attempt to clear the Flatpak font config cache preventing infinite loop in case of failed fix
 */
const FLATPAK_FONT_CONFIG_CACHE_CLEAR_COOL_DOWN = 24 * 60 * 60 * 1000 // 24h

const LAST_FLATPAK_FONT_CONFIG_CACHE_CLEAR_KEY = 'lastFlatpakFontConfigCacheClear'

/**
 * Ensure there is no emoji rendering issue in Flatpak installation resulting in emojis being rendered as text instead of colored.
 * If there is, clear the Flatpak font config cache and relaunch the app.
 */
export async function ensureFlatpakEmojiFontRendering() {
	// Flatpak specific issue only
	if (!window.systemInfo.isFlatpak) {
		return
	}

	// No issues - nothing to fix
	if (!hasEmojiRenderingIssue()) {
		return
	}

	// Prevent the relaunch loop when there is an issue but it is not solved by clearing the cache and relaunch
	const browserStorage = getBuilder('talk-desktop').persist().build()
	const lastFontconfigCacheClear = browserStorage.getItem(LAST_FLATPAK_FONT_CONFIG_CACHE_CLEAR_KEY)

	if (lastFontconfigCacheClear && (Date.now() - parseInt(lastFontconfigCacheClear)) < FLATPAK_FONT_CONFIG_CACHE_CLEAR_COOL_DOWN) {
		console.warn('Emoji rendering issue detected, but font config cache was cleared recently. Probably the issue is not solvable by clearing the cache...')
		return
	}

	browserStorage.setItem(LAST_FLATPAK_FONT_CONFIG_CACHE_CLEAR_KEY, Date.now().toString())

	await window.TALK_DESKTOP.clearFlatpakFontConfigCache()
	await window.TALK_DESKTOP.relaunch()
}

/**
 * Check whether there is an emoji rendering issue resulting in emojis being rendered as text instead of colored images
 * by rendering an emoji on a canvas and checking how colorful it is.
 * The check cost is around 40ms.
 */
export function hasEmojiRenderingIssue(): boolean {
	const EMOJI = '😅'
	// Uncomment for testing of forced text emoji rendering
	// const EMOJI = '😅\uFE0E'

	// Same as in EmojiPicker
	const FONT_FAMILY = '"Segoe UI Emoji","Segoe UI Symbol","Segoe UI","Apple Color Emoji","Twemoji Mozilla","Noto Color Emoji","EmojiOne Color","Android Emoji"'
	const FONT_SIZE = 15
	const WIDTH = 20
	const HEIGHT = 20

	/**
	 * How much colored an emoji must be to consider it successfully colored.
	 * On testing, monochrome text emoji is always 0.0 and colored emoji is usually 0.4..0.6 with bright yellow Noto Color Emojis
	 * Only very gray emojis like 😶‍🌫️ has low chroma and it is still >0.11
	 */
	const CHROMA_THRESHOLD = 0.1

	const canvas = document.createElement('canvas')
	canvas.width = WIDTH
	canvas.height = HEIGHT
	// Uncomment for debugging
	// document.body.appendChild(canvas)

	const ctx = canvas.getContext('2d')!
	ctx.fillStyle = '#000000'
	ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`
	ctx.textAlign = 'center'
	ctx.fillText(EMOJI, WIDTH / 2, FONT_SIZE, WIDTH)

	const { data } = ctx.getImageData(0, 0, WIDTH, HEIGHT)

	const chroma = imageChroma(data)
	console.debug('Flatpak emoji rendering test chroma:', chroma)

	return chroma < CHROMA_THRESHOLD
}

/**
 * Calculates the average chroma of the given pixel data, ignoring transparent parts
 *
 * @param pixels - RGBA pixel image data
 */
function imageChroma(pixels: Uint8ClampedArray): number {
	let totalChroma = 0
	let nonTransparentPixels = 0
	for (let i = 0; i < pixels.length; i += 4) {
		const [r, g, b, a] = [pixels[i]!, pixels[i + 1]!, pixels[i + 2]!, pixels[i + 3]!]
		if (a === 0) {
			continue
		}
		nonTransparentPixels += 1
		totalChroma += Math.max(r, g, b) - Math.min(r, g, b)
	}
	return totalChroma / nonTransparentPixels / 255
}
