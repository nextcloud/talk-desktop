/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// import { getCapabilities } from '@nextcloud/capabilities'
import { loadState } from '@nextcloud/initial-state'
import { appData } from '../../app/AppData.js'

/**
 * Generate a system report data
 */
export function generateSystemReport() {
	return {
		talkDesktop: {
			version: window.TALK_DESKTOP.packageInfo.version,
			builtInTalkVersion: window.TALK_DESKTOP.packageInfo.talkVersion,
		},
		server: appData.credentials
			? {
				version: appData.version.nextcloud.string,
				talkVersion: appData.version.talk,
				signalingMode: loadState('spreed', 'signaling_mode') || 'unknown',
			}
			: null,
		platform: {
			os: window.OS.version,
		},
	}
}

/**
 * Generate a system report in Markdown
 */
export function generateSystemReportMD() {
	const report = generateSystemReport()

	const serverReport = report.server
		? `
- Nextcloud version: ${report.server.version}
- Nextcloud Talk version: ${report.server.talkVersion}
- Signaling mode: ${report.server.signalingMode}
`
		: 'none'

	return `## Nextcloud Talk Desktop

**Operating system:** ${report.platform.os}

**Nextcloud Talk Desktop:** ${report.talkDesktop.version}
- Built-in Nextcloud Talk version: ${report.talkDesktop.builtInTalkVersion}

**Connected to**: ${serverReport}
`
}
