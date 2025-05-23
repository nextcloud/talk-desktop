<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import type { CertificatePrincipal } from 'electron'

import { getLanguage, t } from '@nextcloud/l10n'
import { computed } from 'vue'
import CertificateInfoProperty from './CertificateInfoProperty.vue'
import CertificateInfoSection from './CertificateInfoSection.vue'

const props = defineProps<{
	title: string
	principal: CertificatePrincipal
}>()

const properties = computed(() => [
	['CN', t('talk_desktop', 'Common name'), props.principal.commonName],
	['O', t('talk_desktop', 'Organizations'), formatList(props.principal.organizations)],
	['OU', t('talk_desktop', 'Organizational units'), formatList(props.principal.organizationUnits)],
	['L', t('talk_desktop', 'Locality'), props.principal.locality],
	['C', t('talk_desktop', 'Country'), props.principal.country],
	['S', t('talk_desktop', 'State or province'), props.principal.state],
])

const NA = '<N/A>'

/**
 * Format list
 *
 * @param list - List of tokens
 */
function formatList(list: string[]) {
	return new Intl.ListFormat(getLanguage()).format(list)
}
</script>

<template>
	<CertificateInfoSection :title="title">
		<CertificateInfoProperty
			v-for="[code, name, value] in properties"
			:key="code"
			:term="`${name} (${code})`"
			:value="value || NA" />
	</CertificateInfoSection>
</template>
