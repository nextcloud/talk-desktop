/*!
 * SPDX-FileCopyrightText: {{year}} Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/** Git ref the styles are extracted from: version tag (e.g. "v34.0.0rc1") or branch name (e.g. "master") */
export const versionRef = '{{versionRef}}'
/** Version git reference type used on styles extracting: "tag" or "branch" */
export const versionRefType = '{{versionRefType}}'
/** Version major number, e.g. 34 */
export const versionMajor = {{versionMajor}}
/** Version from $OC_Version, e.g. "34.0.0.5" */
export const version = '{{version}}'
/** Version from $OC_VersionString, e.g. "34.0.0 RC 1" */
export const versionString = '{{versionString}}'
/** Commit hash, e.g. "a1b2c3d" */
export const versionCommitHash = '{{versionCommitHash}}'

/** Available theming configurations */
export const themingConfigs = {{themingConfigs}}
