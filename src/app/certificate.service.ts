/*
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { BrowserWindow, Request } from 'electron'

import { session } from 'electron'
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

/**
 * Verify certificate on a URL.
 * Note: this function only exists due to Electron limitations.
 * If a user accepts the certificate later than the request is rejected by timeout,
 * Electron considers it rejected for 30 minutes or until the app restart.
 * Issue: https://github.com/electron/electron/issues/47267
 * And there is no way to reset the cache.
 * Issue: https://github.com/electron/electron/issues/41448
 * Thus the verification on the defaultSession cannot be used (at least for login).
 * This function makes a single request in a new random session, to avoid verification caching.
 * The actual result is stored in the application config.
 *
 * @param window - Parent browser window
 * @param url - URL
 */
export async function verifyCertificate(window: BrowserWindow, url: string): Promise<boolean> {
	const certificateVerifySession = session.fromPartition(`certificate:verify:${Math.random().toString(36).slice(2, 9)}`)

	let verificationResolvers: PromiseWithResolvers<boolean> | undefined

	certificateVerifySession.setCertificateVerifyProc(async (request, callback) => {
		verificationResolvers = Promise.withResolvers()
		// Use original result, failing the request
		callback(-3)

		const isAccepted = request.errorCode === 0 || await promptCertificateTrust(window, request)
		verificationResolvers.resolve(isAccepted)
	})

	try {
		await certificateVerifySession.fetch(url, { bypassCustomProtocolHandlers: true })
		// Successful request - no SSL errors
		return true
	} catch {
		// SSL Error - handled by user prompt
		if (verificationResolvers) {
			return verificationResolvers.promise
		}
		// Some unexpected network error - not a certificate error
		return true
	}
}
