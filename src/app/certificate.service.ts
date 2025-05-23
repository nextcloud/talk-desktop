/*
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { BrowserWindow, Certificate } from 'electron'

import { showCertificateTrustDialog } from '../certificate/certificate.window.ts'
import { getAppConfig, setAppConfig } from './AppConfig.ts'

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
 * @param certificate - Certificate
 * @return Whether the certificate is accepted as trusted
 */
export async function promptCertificateTrust(window: BrowserWindow, certificate: Certificate): Promise<boolean> {
	const trustedFingerprints = getAppConfig('trustedFingerprints')

	// Already accepted
	if (getAppConfig('trustedFingerprints').includes(certificate.fingerprint)) {
		return true
	}

	// Already in prompt in parallel
	const existingPrompt = pendingCertificateTrustPrompts.get(certificate.fingerprint)
	if (existingPrompt) {
		return existingPrompt
	}

	// Prompt user acceptance
	const pendingDialog = showCertificateTrustDialog(window, certificate)
	pendingCertificateTrustPrompts.set(certificate.fingerprint, pendingDialog)
	const isAccepted = await pendingDialog
	pendingCertificateTrustPrompts.delete(certificate.fingerprint)

	if (isAccepted) {
		setAppConfig('trustedFingerprints', [...trustedFingerprints, certificate.fingerprint])
	}

	return isAccepted
}
