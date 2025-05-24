<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { Certificate } from 'electron'

import { t } from '@nextcloud/l10n'
import { useHotKey } from '@nextcloud/vue/composables/useHotKey'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcNoteCard from '@nextcloud/vue/components/NcNoteCard'
import CertificateInfo from './components/CertificateInfo.vue'

useHotKey('Escape', () => window.close())

const certificate = JSON.parse(decodeURIComponent(location.hash.slice(1))) as Certificate

const acceptCertificate = window.TALK_DESKTOP.acceptCertificate
</script>

<template>
	<div class="certificate">
		<h2 class="certificate__heading">
			{{ t('talk_desktop', 'Untrusted certificate') }}
		</h2>

		<div class="certificate__content">
			<NcNoteCard type="warning" class="certificate__note">
				{{ t('talk_desktop', 'The server\'s security certificate is not trusted. Your connection may not be secure. Proceed only if you trust this certificate.') }}
			</NcNoteCard>

			<CertificateInfo :certificate="certificate" />
		</div>

		<div class="certificate__actions">
			<NcButton variant="secondary" wide @click="acceptCertificate(false)">
				{{ t('talk_desktop', 'Reject') }}
			</NcButton>
			<NcButton variant="primary" wide @click="acceptCertificate(true)">
				{{ t('talk_desktop', 'Accept') }}
			</NcButton>
		</div>
	</div>
</template>

<style>
* {
	box-sizing: border-box;
}
</style>

<style scoped>
.certificate {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	gap: calc(4 * var(--default-grid-baseline));
	padding: calc(4 * var(--default-grid-baseline));
	height: 100%;
	background: var(--color-main-background);
}

.certificate__heading {
	margin-block: 0;
	font-size: 1.5em;
	text-align: center;
	text-transform: capitalize;
}

.certificate__content {
	flex: 1;
	margin-inline: calc(-4 * var(--default-grid-baseline));
	padding-inline: calc(4 * var(--default-grid-baseline));
	display: flex;
	flex-direction: column;
	gap: calc(4 * var(--default-grid-baseline));
	overflow: auto;
}

.certificate__note {
	/* Override default component styles */
	margin: 0;
	margin-block-end: calc(3 * var(--default-grid-baseline));
}

.certificate__actions {
	display: flex;
	gap: calc(2 * var(--default-grid-baseline));
}
</style>
