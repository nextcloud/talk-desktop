/*
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
 * @param title - Table title
 * @param data - Table data
 */
function table(title: string, data: Record<string, string>) {
	const keyLen = Math.max(...Object.keys(data).map((key) => key.length + 4))
	const valueLen = Math.max(...Object.values(data).map((value) => value.length))
	return `| ${b(title).padEnd(keyLen, ' ')} | ${''.padEnd(valueLen, ' ')} |\n`
		+ `| ${''.padEnd(keyLen - 1, '-')}: | ${''.padEnd(valueLen, '-')} |\n`
		+ Object.entries(data).map(([key, value]) => (
			`| ${b(key).padEnd(keyLen, ' ')} | ${value.padEnd(valueLen, ' ')} |`
		)).join('\n')
}

const printBool = (value: boolean) => value ? '✅ yes' : '❌ no'

/**
 * Generate a diagnosis report in Markdown format
 */
export function generateDiagnosisReportMD() {
	const report = generateDiagnosisReport()

	return `### Diagnosis report

${table('Nextcloud Talk Desktop', {
		Version: report.talkDesktop.version,
		'Built-in Talk version': report.talkDesktop.builtInTalkVersion,
		'Release channel': __CHANNEL__,
		'Operating system': report.platform.os,
		'Executable Path': report.talkDesktop.execPath,
		...(window.systemInfo.isLinux
			? { 'Using Wayland': printBool(window.systemInfo.isWayland) }
			: {}
		),
		...(report.server
			? {
					'**Connected to**': '-',
					'Nextcloud version': report.server.version,
					'Nextcloud Talk version': report.server.talkVersion,
					'`notifications` app enabled': printBool(report.server.notifications),
					'`notify_push` app enabled': printBool(report.server.notify_push),
				}
			: {
					'**Connected to**': 'none',
				}),
	})
}

#### Application config

\`\`\`json
${JSON.stringify(getAppConfig(), null, 2)}
\`\`\`
`
}
