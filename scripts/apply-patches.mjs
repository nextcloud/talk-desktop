/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Applies the patches in patches/ via patch-package, skipping any whose target
 * package is not installed on this platform.
 *
 * patch-package on its own is not safe to run as a blanket postinstall here:
 * it treats "patch file found for a package that is not present" as a fatal
 * error, with no flag to downgrade it. patches/macos-alias+0.2.11.patch targets
 * macos-alias, which is `os: ["darwin"]` and optional, so npm skips it entirely
 * on Linux and Windows - and `npm ci` would then fail on those platforms.
 *
 * Skipping is deliberately keyed on the package actually being absent rather
 * than on process.platform, so a future patch for a cross-platform package
 * still applies everywhere.
 *
 * The applicable patches are staged into a temporary directory passed via
 * --patch-dir. patch-package only *applies* patches when invoked with no
 * package arguments - passing package names instead makes it *regenerate*
 * them, which would silently rewrite the committed patch on every install.
 */

import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const patchesDir = path.join(root, 'patches')

if (!existsSync(patchesDir)) {
	process.exit(0)
}

/**
 * Recovers the package name from a patch filename.
 * patch-package writes `<name with / replaced by +>+<version>.patch`,
 * e.g. `macos-alias+0.2.11.patch` or `@scope+pkg+1.0.0.patch`.
 *
 * @param {string} filename - patch file name
 * @return {string} the npm package name
 */
function packageNameFromPatch(filename) {
	const segments = filename.replace(/\.patch$/, '').replace(/\.dev$/, '').split('+')
	// The last segment is the version, everything before it is the (possibly scoped) name
	return segments.slice(0, -1).join('/')
}

const patches = readdirSync(patchesDir).filter((file) => file.endsWith('.patch'))
const applicable = patches.filter((patch) => {
	const name = packageNameFromPatch(patch)
	if (existsSync(path.join(root, 'node_modules', name))) {
		return true
	}
	console.log(`[apply-patches] Skipping ${patch}: ${name} is not installed on ${process.platform}`)
	return false
})

if (applicable.length === 0) {
	console.log('[apply-patches] No applicable patches for this platform')
	process.exit(0)
}

// Stage only the applicable patches, so patch-package never sees a patch whose
// package is missing. Lives under node_modules so it is never committed.
const stagingDir = path.join(root, 'node_modules', '.cache', 'talk-desktop-patches')
rmSync(stagingDir, { force: true, recursive: true })
mkdirSync(stagingDir, { recursive: true })
for (const patch of applicable) {
	copyFileSync(path.join(patchesDir, patch), path.join(stagingDir, patch))
}

try {
	execFileSync(
		process.execPath,
		[
			path.join(root, 'node_modules', 'patch-package', 'index.js'),
			'--patch-dir',
			path.relative(root, stagingDir),
			'--error-on-fail',
		],
		{ cwd: root, stdio: 'inherit' },
	)
} finally {
	rmSync(stagingDir, { force: true, recursive: true })
}
