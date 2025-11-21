<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import { t } from '@nextcloud/l10n'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcNoteCard from '@nextcloud/vue/components/NcNoteCard'

/**
 * Restart the app
 */
function relaunch() {
	window.TALK_DESKTOP.relaunchWindow()
}
</script>

<template>
	<NcNoteCard type="info" class="relaunch-require-note-card">
		<div class="relaunch-require-note-card__content">
			<span>{{ t('talk_desktop', 'Some changes require a relaunch to take effect') }}</span>
			<NcButton
				variant="primary"
				size="small"
				class="relaunch-require-note-card__button"
				@click="relaunch">
				{{ t('talk_desktop', 'Restart') }}
			</NcButton>
		</div>
	</NcNoteCard>
</template>

<style scoped>
.relaunch-require-note-card {
	margin-block-start: 0 !important;
}

.relaunch-require-note-card > :deep(div) {
	flex: 1; /* TODO: fix in upstream */
}

.relaunch-require-note-card__content {
	display: flex;
	gap: var(--default-grid-baseline);
	align-items: flex-start;
}

.relaunch-require-note-card__button {
	margin-inline-start: auto;
	flex: 0 0 auto;
}
</style>
