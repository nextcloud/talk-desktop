/*!
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { appData } from '../../app/AppData.js'
import { getAppConfig } from '../../shared/appConfig.service.ts'

/**
 * Generate diagnosis report data
 */
export function generateDiagnosisReport() {
	return {
		talkDesktop: {
			version: __VERSION_TAG__,
			builtInTalkVersion: __TALK_VERSION_TAG__,
			execPath: window.systemInfo.execPath,
		},
		server: appData.credentials
			? {
					channel: __CHANNEL__,
					version: appData.version.nextcloud?.string ?? 'Not available',
					talkVersion: appData.version.talk ?? 'Not available',
					notifications: !!(appData.capabilities as any)?.notifications, // eslint-disable-line
					notify_push: !!(appData.capabilities as any)?.notify_push?.type?.includes('notifications'), // eslint-disable-line
				}
			: null,
		platform: {
			os: window.systemInfo.osVersion,
		},
	}
}

const b = (str: string) => `**${str}**`

/**
 * Generate MD table
 *
 * @param data - Table data
 */
function table(data: string[][]) {
	// Bold the first column as heading column
	const rows = data.map((row) => [b(row[0]!), ...row.slice(1)])

	const colWidths = rows[0]!.map((_, col) => Math.max(...rows.map((row) => row[col]!.length)))

	// Insert heading separator |--:|---|---|
	rows.splice(1, 0, colWidths.map((width) => '-'.repeat(width)))
	// The first column is end-aligned
	rows[1]![0] = rows[1]![0]!.slice(0, -1) + ':'

	// Apply replacements and align column widths
	const formattedRows = rows.map((row) => (
		row.map((cell, col) => cell!
			.replace('{line}', '–'.repeat(colWidths[col]! - (cell.length - '{line}'.length)))
			.padEnd(colWidths[col]!, ' '))
	))

	return formattedRows.map((row) => (
		`| ${row.join(' | ')} |`
	)).join('\n')
}

const printBool = (value: boolean) => value ? '✅ yes' : '❌ no'

/**
 * Generate a diagnosis report in Markdown format
 */
export function generateDiagnosisReportMD() {
	const report = generateDiagnosisReport()

	return `# Diagnosis report

${table([
	['{line} Application', '{line}'],
	['Version', report.talkDesktop.version],
	['Built-in Talk version', report.talkDesktop.builtInTalkVersion],
	['Release channel', __CHANNEL__],

	['{line} System', '{line}'],
	['Operating system', report.platform.os],
	['Executable path', report.talkDesktop.execPath],
	...(window.systemInfo.isLinux
		? [
				['Using Wayland', printBool(window.systemInfo.isWayland)],
			]
		: []),

	...(report.server
		? [
				['{line} Server', '{line}'],
				['Server version', `v${report.server.version}`],
				['`talk` app', `v${report.server.talkVersion}`],
				['`notifications` app', report.server.notifications ? '✅ Enabled' : '⚠️ Not available'],
				['`notify_push` app', report.server.notify_push ? '✅ Enabled' : '⚠️ Not available'],
			]
		: [['{line} Server', 'Not connected']]),
])}

## Application config

\`\`\`json
${JSON.stringify(getAppConfig(), null, 2)}
\`\`\`
`
}
