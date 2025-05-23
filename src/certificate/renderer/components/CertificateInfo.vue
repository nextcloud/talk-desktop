<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import type { Certificate } from 'electron'

import { getCanonicalLocale, t } from '@nextcloud/l10n'
import { computed } from 'vue'
import CertificateInfoProperty from './CertificateInfoProperty.vue'
import CertificateInfoSection from './CertificateInfoSection.vue'
import CertificatePrincipalSection from './CertificatePrincipalSection.vue'
import { parseElectronCertificateFingerprint } from '../certificate.utils.ts'

const props = defineProps<{
	certificate: Certificate
}>()

const fingerprint = computed(() => parseElectronCertificateFingerprint(props.certificate.fingerprint))

/**
 * Format validity date
 *
 * @param timestamp - UNIX Timestamp
 */
function formatDate(timestamp: number) {
	return new Date(timestamp * 1_000).toLocaleString(getCanonicalLocale(), { dateStyle: 'medium', timeStyle: 'medium' })
}
</script>

<template>
	<dl class="certificate-info" :title="t('talk_desktop', 'Certificate details')">
		<CertificatePrincipalSection :title="t('talk_desktop', 'Issued by')" :principal="certificate.issuer" />
		<CertificatePrincipalSection :title="t('talk_desktop', 'Issued to')" :principal="certificate.subject" />

		<CertificateInfoSection :title="t('talk_desktop', 'Validity period')">
			<CertificateInfoProperty :term="t('talk_desktop', 'Valid from')" :value="formatDate(certificate.validStart)" />
			<CertificateInfoProperty :term="t('talk_desktop', 'Valid until')" :value="formatDate(certificate.validExpiry)" />
		</CertificateInfoSection>

		<CertificateInfoSection :title="t('talk_desktop', 'Fingerprint')">
			<CertificateInfoProperty :term="fingerprint.algorithm">
				<code>{{ fingerprint.value }}</code>
			</CertificateInfoProperty>
		</CertificateInfoSection>
	</dl>
</template>

<style scoped>
.certificate-info {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	gap: calc(3 * var(--default-grid-baseline));
	padding: 0;
}
</style>
