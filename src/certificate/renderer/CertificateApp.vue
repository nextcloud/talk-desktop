<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { UntrustedCertificateDetails } from '../../app/certificate.service.ts'

import { t } from '@nextcloud/l10n'
import { useHotKey } from '@nextcloud/vue/composables/useHotKey'
import { ref } from 'vue'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcNoteCard from '@nextcloud/vue/components/NcNoteCard'
import IconAlert from 'vue-material-design-icons/Alert.vue'
import IconShieldOffOutline from 'vue-material-design-icons/ShieldOffOutline.vue'
import AppWindow from '../../shared/components/AppWindow.vue'
import CertificateInfo from './components/CertificateInfo.vue'

useHotKey('Escape', () => window.close())

const { hostname, certificate, verificationResult } = JSON.parse(decodeURIComponent(location.hash.slice(1))) as UntrustedCertificateDetails
const urlParam = {
	value: `<strong>${hostname}</strong>`,
	escape: false,
}

const acceptCertificate = window.TALK_DESKTOP.acceptCertificate

const isAdvanced = ref(false)
</script>

<template>
	<AppWindow :title="t('talk_desktop', 'Security warning')" class="certificate">
		<h2 class="certificate__heading">
			{{ t('talk_desktop', 'Warning: potential security risk') }}
		</h2>

		<NcNoteCard type="error" class="certificate__note">
			<template #icon>
				<IconShieldOffOutline :size="24" class="certificate__note-icon" />
			</template>
			<!-- eslint-disable-next-line -->
			<p v-html="t('talk_desktop', 'Connection to {url} is not private.', { url: urlParam })"/>
		</NcNoteCard>

		<div class="certificate__content" :class="{ 'certificate__content--empty': !isAdvanced }">
			<template v-if="!isAdvanced">
				<IconAlert :size="128" class="certificate__alert-icon" />
				<p id="advanced-description">
					{{ t('talk-desktop', 'If you are unsure how to proceed contact your system administrator.') }}
				</p>
				<NcButton
					aria-describedby="advanced-description"
					variant="secondary"
					@click="isAdvanced = true">
					{{ t('talk_desktop', 'Advanced') }}
				</NcButton>
			</template>

			<template v-else>
				<!-- eslint-disable-next-line -->
        <p v-html="t('talk_desktop', 'This server could not prove that it is {url}.', { url: urlParam })"/>
				<p>
					{{ t('talk_desktop', 'It has untrusted SSL certificate. This might be caused by an attacker intercepting your connection or server misconfiguration.') }}
				</p>
				<p>
					{{ t('talk-desktop', 'If you are unsure how to proceed contact your system administrator.') }}
				</p>
				<p>
					<code>{{ verificationResult }}</code>
				</p>
				<NcButton variant="error" @click="acceptCertificate(true)">
					{{ t('talk_desktop', 'Proceed') }}
				</NcButton>
				<details>
					<summary>
						{{ t('talk_desktop', 'View certificate') }}
					</summary>
					<CertificateInfo :certificate="certificate" />
				</details>
			</template>
		</div>

		<div class="certificate__actions">
			<NcButton variant="primary" wide @click="acceptCertificate(false)">
				{{ t('talk_desktop', 'Cancel') }}
			</NcButton>
		</div>
	</AppWindow>
</template>

<style scoped>
.certificate {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	gap: calc(4 * var(--default-grid-baseline));
	padding: calc(4 * var(--default-grid-baseline));
	background: var(--color-main-background);
}

.certificate__heading {
	display: flex;
	align-items: baseline;
	justify-content: center;
	gap: 1ch;
	margin-block: 0;
	font-size: 1.5em;
	text-transform: capitalize;
}

.certificate__alert-icon {
  color: var(--color-placeholder-dark);
}

.certificate__note {
  /* Override default component styles */
  margin: 0;
}

.certificate__note-icon {
  color: var(--color-error);
}

.certificate__content {
  background-color: var(--color-background-dark);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: calc(2 * var(--default-grid-baseline));
  padding: calc(2 * var(--default-grid-baseline));
  border-radius: var(--border-radius-small);
  overflow: auto;
}

.certificate__content--empty {
  align-items: center;
  justify-content: center;
}

.certificate__actions {
	display: flex;
	align-items: flex-end;
	gap: calc(2 * var(--default-grid-baseline));
}
</style>
