/*
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { semverGt } from './semver.utils.mjs'

if (os.platform() === 'win32') {
	usePwsh()
}

// Verify that GitHub CLI is available and authenticated
await $`gh auth status`

// Read the current version
const packageJsonPath = path.join(__dirname, '../package.json')
const packageJson = await fs.readJson(packageJsonPath)

const currentBeta = packageJson.talk.beta
const currentStable = packageJson.talk.stable

// Check the latest releases
const latestStable = (await $`gh release list -R nextcloud-releases/spreed --json tagName --limit=1 --exclude-drafts --exclude-pre-releases`.json())[0].tagName
const latestBeta = (await $`gh release list -R nextcloud-releases/spreed --json tagName --limit=1 --exclude-drafts`.json())[0].tagName

echo`Stable:`
echo`- Current: ${currentStable}`
echo`- Latest: ${latestStable}`
echo``
echo`Beta:`
echo`- Current: ${currentBeta}`
echo`- Latest: ${latestBeta}`
echo``

// Update the version if necessary
if (semverGt(latestStable, currentStable)) {
	echo`Updating stable from ${currentStable} to ${latestStable}`
	packageJson.talk.stable = latestStable
}

if (semverGt(latestBeta, currentBeta)) {
	echo`Updating beta from ${currentBeta} to ${latestBeta}`
	packageJson.talk.beta = latestBeta
}

// Write package.json
await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })
