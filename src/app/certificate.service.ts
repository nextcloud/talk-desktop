/*
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { BrowserWindow, Request } from 'electron'

import { showCertificateTrustDialog } from '../certificate/certificate.window.ts'
import { getAppConfig, setAppConfig } from './AppConfig.ts'

export type UntrustedCertificateDetails = Pick<Request, 'hostname' | 'certificate' | 'verificationResult'>

/**
 * Pending showCertificateTrustDialog prompts per fingerprint to prevent duplicated dialogs
 */
const pendingCertificateTrustPrompts: Map<string, Promise<boolean>> = new Map()

/**
 * Handle request for untrusted certificate acceptance.
 * For unknown certificates, show custom certificate trust dialog.
 * Note: dialog.showCertificateTrustDialog is not used
 * since application level trusted dialog is needed, not system-level
 *
 * @param window - Parent window
 * @param details - Error details
 * @return Whether the certificate is accepted as trusted
 */
export async function promptCertificateTrust(window: BrowserWindow, details: UntrustedCertificateDetails): Promise<boolean> {
	const fingerprint = details.certificate.fingerprint
	const trustedFingerprints = getAppConfig('trustedFingerprints')

	// Already accepted
	if (trustedFingerprints.includes(fingerprint)) {
		return true
	}

	// Already in prompt in parallel
	const existingPrompt = pendingCertificateTrustPrompts.get(fingerprint)
	if (existingPrompt) {
		return existingPrompt
	}

	// Prompt user acceptance
	const pendingDialog = showCertificateTrustDialog(window, details)
	pendingCertificateTrustPrompts.set(fingerprint, pendingDialog)
	const isAccepted = await pendingDialog
	pendingCertificateTrustPrompts.delete(fingerprint)

	if (isAccepted) {
		setAppConfig('trustedFingerprints', [...trustedFingerprints, fingerprint])
	}

	return isAccepted
}
