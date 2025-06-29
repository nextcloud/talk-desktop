<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import type { UserStatusBackup } from '../userStatus.types.ts'

import { t } from '@nextcloud/l10n'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcNoteCard from '@nextcloud/vue/components/NcNoteCard'
import NcUserStatusIcon from '@nextcloud/vue/components/NcUserStatusIcon'

defineProps<{
	userStatus: UserStatusBackup
}>()

const emit = defineEmits<{
	revert: []
}>()
</script>

<template>
	<NcNoteCard type="info" class="user-status-form-backup">
		<div class="user-status-form-backup__inner">
			<span>{{ t('talk_desktop', 'Your status was set automatically') }}</span>
			<span class="user-status-form-backup__reset">
				<span class="user-status-form-backup__status">
					<span>
						<template v-if="userStatus.icon">
							{{ userStatus.icon }}
						</template>
						<NcUserStatusIcon v-else-if="'status' in userStatus" :status="userStatus.status" />
					</span>
					<span>
						{{ userStatus.message || t('talk_desktop', 'No status message') }}
					</span>
				</span>
				<NcButton
					class="user-status-form-backup__reset-button"
					size="small"
					variant="primary"
					@click="emit('revert')">
					{{ t('talk_desktop', 'Reset') }}
				</NcButton>
			</span>
		</div>
	</NcNoteCard>
</template>

<style scoped>
/* TODO: fix upstream */
.user-status-form-backup > :deep(div) {
	flex: 1;
}

.user-status-form-backup__inner {
	display: flex;
	flex-direction: column;
	gap: calc(2 * var(--default-grid-baseline));
}

.user-status-form-backup__status {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: calc(2 * var(--default-grid-baseline));
}

.user-status-form-backup__reset {
	display: flex;
	flex-direction: row;
	align-items: flex-end;
	justify-content: space-between;
	gap: calc(2 * var(--default-grid-baseline));
}

.user-status-form-backup__reset-button {
	flex: 0 0 auto;
}
</style>
