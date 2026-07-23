/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type * as Koffi from 'koffi'

import { isWindows } from './system.utils.ts'

/**
 * A window icon as raw bitmap pixels.
 */
export type WindowIconBitmap = {
	width: number
	height: number
	/** Raw BGRA pixels, top-down, straight (non-premultiplied) alpha */
	data: Buffer
}

/**
 * Information about a top-level native window (Windows only).
 */
export type NativeWindowInfo = {
	/** Native window handle (HWND) as a number */
	hwnd: number
	/** Window title */
	title: string
	/** Whether the window is currently minimized (iconic) */
	minimized: boolean
	/** The window's own icon (same one Windows shows in the taskbar), or null if it has none */
	icon: WindowIconBitmap | null
}

// Win32 constants
const GW_OWNER = 4
const GWL_EXSTYLE = -20
const WS_EX_TOOLWINDOW = 0x00000080
const DWMWA_CLOAKED = 14
const SW_RESTORE = 9
const WM_GETICON = 0x007f
const ICON_BIG = 1
const ICON_SMALL2 = 2
const GCLP_HICON = -14
const GCLP_HICONSM = -34
const BI_RGB = 0
const DIB_RGB_COLORS = 0
const SMTO_ABORTIFHUNG = 0x0002
// WM_GETICON is a blocking SendMessage; use a short timeout so an unresponsive window
// can never freeze the enumeration (and with it the whole picker).
const WM_GETICON_TIMEOUT_MS = 200

/**
 * Bound user32/gdi32/dwmapi functions, resolved lazily on first use.
 */
type NativeBindings = {
	koffi: typeof Koffi
	sizeofBITMAP: number
	EnumWindowsProc: Koffi.IKoffiCType
	EnumWindows: (proc: unknown, lparam: number) => boolean
	IsWindowVisible: (hwnd: number) => boolean
	IsIconic: (hwnd: number) => boolean
	GetWindow: (hwnd: number, cmd: number) => number
	GetWindowLongW: (hwnd: number, index: number) => number
	GetWindowTextLengthW: (hwnd: number) => number
	GetWindowTextW: (hwnd: number, buffer: Uint16Array, max: number) => number
	DwmGetWindowAttribute: (hwnd: number, attribute: number, value: Int32Array, size: number) => number
	ShowWindowAsync: (hwnd: number, cmd: number) => boolean
	SetForegroundWindow: (hwnd: number) => boolean
	SendMessageTimeoutW: (hwnd: number, msg: number, wparam: number, lparam: number, flags: number, timeout: number, result: BigUint64Array) => number
	GetClassLongPtrW: (hwnd: number, index: number) => number
	GetIconInfo: (hicon: number, info: Record<string, number>) => boolean
	GetObjectW: (handle: number, cb: number, obj: Record<string, number>) => number
	GetDC: (hwnd: number) => number
	ReleaseDC: (hwnd: number, hdc: number) => number
	GetDIBits: (hdc: number, hbmp: number, start: number, lines: number, bits: Uint8Array, bmi: Record<string, number>, usage: number) => number
	DeleteObject: (obj: number) => boolean
}

let bindings: NativeBindings | null = null
let bindingsUnavailable = false

/**
 * Lazily load koffi and bind the required user32/gdi32/dwmapi functions.
 * Returns null on non-Windows platforms or if the native module cannot be loaded,
 * so callers can treat native access as a best-effort enhancement.
 */
function getBindings(): NativeBindings | null {
	if (bindings) {
		return bindings
	}
	if (bindingsUnavailable || !isWindows) {
		return null
	}

	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports -- koffi is a native module kept external from the bundle
		const koffi = require('koffi') as typeof Koffi
		const user32 = koffi.load('user32.dll')
		const gdi32 = koffi.load('gdi32.dll')
		const dwmapi = koffi.load('dwmapi.dll')

		koffi.struct('ICONINFO', {
			fIcon: 'int',
			xHotspot: 'uint32',
			yHotspot: 'uint32',
			hbmMask: 'uintptr_t',
			hbmColor: 'uintptr_t',
		})
		koffi.struct('BITMAP', {
			bmType: 'int32',
			bmWidth: 'int32',
			bmHeight: 'int32',
			bmWidthBytes: 'int32',
			bmPlanes: 'uint16',
			bmBitsPixel: 'uint16',
			bmBits: 'uintptr_t',
		})
		koffi.struct('BITMAPINFOHEADER', {
			biSize: 'uint32',
			biWidth: 'int32',
			biHeight: 'int32',
			biPlanes: 'uint16',
			biBitCount: 'uint16',
			biCompression: 'uint32',
			biSizeImage: 'uint32',
			biXPelsPerMeter: 'int32',
			biYPelsPerMeter: 'int32',
			biClrUsed: 'uint32',
			biClrImportant: 'uint32',
		})

		// HWND and other handles are marshaled as pointer-sized integers (uintptr_t),
		// which fit in a JS number for all real-world handles.
		bindings = {
			koffi,
			sizeofBITMAP: koffi.sizeof('BITMAP'),
			EnumWindowsProc: koffi.proto('bool __stdcall EnumWindowsProc(uintptr_t hwnd, intptr_t lparam)'),
			EnumWindows: user32.func('bool __stdcall EnumWindows(void *proc, intptr_t lparam)'),
			IsWindowVisible: user32.func('bool __stdcall IsWindowVisible(uintptr_t hwnd)'),
			IsIconic: user32.func('bool __stdcall IsIconic(uintptr_t hwnd)'),
			GetWindow: user32.func('uintptr_t __stdcall GetWindow(uintptr_t hwnd, uint cmd)'),
			GetWindowLongW: user32.func('long __stdcall GetWindowLongW(uintptr_t hwnd, int index)'),
			GetWindowTextLengthW: user32.func('int __stdcall GetWindowTextLengthW(uintptr_t hwnd)'),
			GetWindowTextW: user32.func('int __stdcall GetWindowTextW(uintptr_t hwnd, _Out_ uint16_t *buffer, int max)'),
			DwmGetWindowAttribute: dwmapi.func('int __stdcall DwmGetWindowAttribute(uintptr_t hwnd, uint attribute, _Out_ int *value, uint size)'),
			ShowWindowAsync: user32.func('bool __stdcall ShowWindowAsync(uintptr_t hwnd, int cmd)'),
			SetForegroundWindow: user32.func('bool __stdcall SetForegroundWindow(uintptr_t hwnd)'),
			SendMessageTimeoutW: user32.func('uintptr_t __stdcall SendMessageTimeoutW(uintptr_t hwnd, uint msg, uintptr_t wparam, intptr_t lparam, uint flags, uint timeout, _Out_ uintptr_t *result)'),
			GetClassLongPtrW: user32.func('uintptr_t __stdcall GetClassLongPtrW(uintptr_t hwnd, int index)'),
			GetIconInfo: user32.func('bool __stdcall GetIconInfo(uintptr_t hicon, _Out_ ICONINFO *info)'),
			GetObjectW: gdi32.func('int __stdcall GetObjectW(uintptr_t handle, int cb, _Out_ BITMAP *obj)'),
			GetDC: user32.func('uintptr_t __stdcall GetDC(uintptr_t hwnd)'),
			ReleaseDC: user32.func('int __stdcall ReleaseDC(uintptr_t hwnd, uintptr_t hdc)'),
			GetDIBits: gdi32.func('int __stdcall GetDIBits(uintptr_t hdc, uintptr_t hbmp, uint start, uint lines, _Out_ uint8_t *bits, _Inout_ BITMAPINFOHEADER *bmi, uint usage)'),
			DeleteObject: gdi32.func('bool __stdcall DeleteObject(uintptr_t obj)'),
		}
		return bindings
	} catch (error) {
		console.error('[nativeWindows] Failed to load native bindings:', error)
		bindingsUnavailable = true
		return null
	}
}

/**
 * Read a window title via GetWindowTextW.
 *
 * @param native - Resolved native bindings
 * @param hwnd - Native window handle
 */
function getWindowTitle(native: NativeBindings, hwnd: number): string {
	const length = native.GetWindowTextLengthW(hwnd)
	if (length <= 0) {
		return ''
	}
	const buffer = new Uint16Array(length + 1)
	const written = native.GetWindowTextW(hwnd, buffer, buffer.length)
	if (written <= 0) {
		return ''
	}
	return Buffer.from(buffer.buffer, 0, written * 2).toString('utf16le').replace(/[\r\n]+/g, ' ').trim()
}

/**
 * Query a window's icon via WM_GETICON with a timeout, so an unresponsive window
 * cannot block the enumeration. Returns the HICON as a number, or 0.
 *
 * @param native - Resolved native bindings
 * @param hwnd - Native window handle
 * @param iconType - ICON_BIG or ICON_SMALL2
 */
function queryWindowIcon(native: NativeBindings, hwnd: number, iconType: number): number {
	const result = new BigUint64Array(1)
	const ok = native.SendMessageTimeoutW(hwnd, WM_GETICON, iconType, 0, SMTO_ABORTIFHUNG, WM_GETICON_TIMEOUT_MS, result)
	return ok ? Number(result[0]) : 0
}

/**
 * Get the window's own icon (the same one shown in the taskbar) as a raw BGRA bitmap.
 * Tries WM_GETICON first, then the window class icon. Returns null if the window has no icon.
 *
 * @param native - Resolved native bindings
 * @param hwnd - Native window handle
 */
function getWindowIconBitmap(native: NativeBindings, hwnd: number): WindowIconBitmap | null {
	let hicon = queryWindowIcon(native, hwnd, ICON_BIG)
	if (!hicon) {
		hicon = queryWindowIcon(native, hwnd, ICON_SMALL2)
	}
	if (!hicon) {
		hicon = native.GetClassLongPtrW(hwnd, GCLP_HICON)
	}
	if (!hicon) {
		hicon = native.GetClassLongPtrW(hwnd, GCLP_HICONSM)
	}
	if (!hicon) {
		return null
	}

	const iconInfo: Record<string, number> = {}
	if (!native.GetIconInfo(hicon, iconInfo)) {
		return null
	}
	const hbmColor = iconInfo.hbmColor
	const hbmMask = iconInfo.hbmMask
	try {
		if (!hbmColor) {
			return null
		}
		const bitmap: Record<string, number> = {}
		if (!native.GetObjectW(hbmColor, native.sizeofBITMAP, bitmap)) {
			return null
		}
		const width = bitmap.bmWidth
		const height = bitmap.bmHeight
		if (width <= 0 || height <= 0 || width > 512 || height > 512) {
			return null
		}

		// Negative height requests a top-down 32bpp DIB, so rows don't need flipping
		const header = {
			biSize: 40,
			biWidth: width,
			biHeight: -height,
			biPlanes: 1,
			biBitCount: 32,
			biCompression: BI_RGB,
			biSizeImage: 0,
			biXPelsPerMeter: 0,
			biYPelsPerMeter: 0,
			biClrUsed: 0,
			biClrImportant: 0,
		}
		const pixels = new Uint8Array(width * height * 4)
		const hdc = native.GetDC(0)
		try {
			if (!native.GetDIBits(hdc, hbmColor, 0, height, pixels, header, DIB_RGB_COLORS)) {
				return null
			}
		} finally {
			native.ReleaseDC(0, hdc)
		}
		return { width, height, data: Buffer.from(pixels) }
	} finally {
		if (hbmColor) {
			native.DeleteObject(hbmColor)
		}
		if (hbmMask) {
			native.DeleteObject(hbmMask)
		}
	}
}

/**
 * Whether a window is cloaked (hidden by DWM, e.g. a UWP window on another virtual desktop).
 *
 * @param native - Resolved native bindings
 * @param hwnd - Native window handle
 */
function isCloaked(native: NativeBindings, hwnd: number): boolean {
	const value = new Int32Array(1)
	const result = native.DwmGetWindowAttribute(hwnd, DWMWA_CLOAKED, value, 4)
	// result is an HRESULT; only trust the value on success (S_OK === 0)
	return result === 0 && value[0] !== 0
}

/**
 * Enumerate top-level windows the user would expect to be able to share,
 * including minimized ones (which Chromium/WebRTC omits from desktopCapturer).
 *
 * Applies the standard Alt-Tab eligibility heuristic: visible, unowned, not a tool window,
 * has a title, and not cloaked. For minimized windows, also resolves the window icon
 * (desktopCapturer only provides icons for the non-minimized ones).
 *
 * Returns an empty array on non-Windows platforms or on any failure — the caller
 * treats native enumeration as a best-effort enhancement over desktopCapturer.
 */
export async function listNativeWindows(): Promise<NativeWindowInfo[]> {
	const native = getBindings()
	if (!native) {
		return []
	}

	const windows: NativeWindowInfo[] = []
	let callback: Koffi.IKoffiRegisteredCallback | undefined

	try {
		callback = native.koffi.register((hwnd: number): boolean => {
			try {
				if (!native.IsWindowVisible(hwnd)) {
					return true
				}
				if (native.GetWindow(hwnd, GW_OWNER) !== 0) {
					return true
				}
				if ((native.GetWindowLongW(hwnd, GWL_EXSTYLE) & WS_EX_TOOLWINDOW) !== 0) {
					return true
				}
				const title = getWindowTitle(native, hwnd)
				if (!title) {
					return true
				}
				if (isCloaked(native, hwnd)) {
					return true
				}
				const minimized = native.IsIconic(hwnd)
				const icon = minimized ? getWindowIconBitmap(native, hwnd) : null
				windows.push({ hwnd: Number(hwnd), title, minimized, icon })
			} catch {
				// Skip any window that throws — never break the enumeration
			}
			return true
		}, native.koffi.pointer(native.EnumWindowsProc))

		native.EnumWindows(callback, 0)
	} catch (error) {
		console.error('[nativeWindows] Failed to enumerate windows:', error)
	} finally {
		if (callback) {
			native.koffi.unregister(callback)
		}
	}

	return windows
}

/**
 * Restore (un-minimize) and foreground a native window so that it becomes
 * renderable and therefore capturable by WebRTC.
 *
 * @param hwnd - Native window handle
 * @return true on success, false on failure or non-Windows platforms
 */
export async function restoreNativeWindow(hwnd: number): Promise<boolean> {
	const native = getBindings()
	if (!native || !Number.isFinite(hwnd) || hwnd === 0) {
		return false
	}

	try {
		native.ShowWindowAsync(hwnd, SW_RESTORE)
		native.SetForegroundWindow(hwnd)
		return true
	} catch (error) {
		console.error('[nativeWindows] Failed to restore window:', error)
		return false
	}
}
