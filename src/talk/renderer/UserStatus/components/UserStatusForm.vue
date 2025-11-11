<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { PredefinedUserStatus, UserStatusBackup, UserStatusPrivate } from '../userStatus.types.ts'

import { t } from '@nextcloud/l10n'
import { computed, ref, toRef } from 'vue'
import NcButton from '@nextcloud/vue/components/NcButton'
import UserStatusFormBackup from './UserStatusFormBackup.vue'
import UserStatusFormClearAt from './UserStatusFormClearAt.vue'
import UserStatusFormCustomMessage from './UserStatusFormCustomMessage.vue'
import UserStatusFormPredefinedOption from './UserStatusFormPredefinedOption.vue'
import UserStatusFormStatusType from './UserStatusFormStatusType.vue'
import { usePredefinedStatusesStore } from '../predefinedStatuses.store.ts'
import { useUserStatusStore } from '../userStatus.store.ts'
import { convertPredefinedStatusToUserStatus } from '../userStatus.utils.ts'

const backupStatus = defineModel<UserStatusBackup | null>('backupStatus', { required: true })

const emit = defineEmits<{
	submit: []
}>()

const userStatusStore = useUserStatusStore()
const userStatus = ref<UserStatusPrivate>({ ...userStatusStore.userStatus! })

const isDirty = ref(false)

const predefinedStatuses = toRef(() => usePredefinedStatusesStore().predefinedStatuses)

const statusIsUserDefined = computed(() => !backupStatus.value && (userStatus.value.icon || userStatus.value.message))
const isClear = computed(() => userStatus.value.status === 'online' && !userStatus.value.icon && !userStatus.value.message)

/**
 * Patch the user status with the new values
 *
 * @param newUserStatus - New user status values
 */
function patchStatus(newUserStatus: Partial<UserStatusPrivate>) {
	isDirty.value = true
	Object.assign(userStatus.value, newUserStatus)
}

/**
 * Select a predefined status
 *
 * @param status - Predefined status to select
 */
function selectPredefinedStatus(status: PredefinedUserStatus) {
	patchStatus(convertPredefinedStatusToUserStatus(status))
}

/**
 * Clear the custom message
 */
function clearUserStatusCustomMessage() {
	patchStatus({
		messageId: null,
		messageIsPredefined: false,
		message: null,
		icon: null,
		clearAt: null,
	})
}

/**
 * Save the user status
 */
async function save() {
	const isSuccess = await userStatusStore.saveUserStatus(userStatus.value)
	if (isSuccess) {
		emit('submit')
	}
}

/**
 * Revert the user status from the backup
 */
async function revertStatus() {
	await userStatusStore.revertUserStatusFromBackup()
	userStatus.value = { ...userStatusStore.userStatus! }
	backupStatus.value = null
}
</script>

<template>
	<div class="user-status-form">
		<UserStatusFormStatusType class="user-status-form__row" :status="userStatus.status" @update:status="patchStatus({ status: $event })" />

		<UserStatusFormBackup
			v-if="backupStatus"
			class="user-status-form__row"
			:user-status="backupStatus"
			@revert="revertStatus" />

		<UserStatusFormCustomMessage
			class="user-status-form__row"
			:message="userStatus.message"
			:icon="userStatus.icon"
			@update:message="patchStatus({ message: $event })"
			@update:icon="patchStatus({ icon: $event })" />

		<div class="user-status-form__predefined-statuses">
			<UserStatusFormPredefinedOption
				v-for="status in predefinedStatuses"
				:key="status.id"
				:pressed="userStatus.messageId === status.id"
				:user-status="status"
				@click="selectPredefinedStatus(status)" />
		</div>

		<UserStatusFormClearAt
			class="user-status-form__row"
			:disabled="isClear"
			:clear-at="userStatus.clearAt"
			@update:clear-at="patchStatus({ clearAt: $event })" />

		<NcButton
			class="user-status-form__row"
			variant="secondary"
			wide
			:disabled="!statusIsUserDefined"
			@click="clearUserStatusCustomMessage">
			{{ t('talk_desktop', 'Clear custom status') }}
		</NcButton>

		<div class="user-status-form__buttons">
			<NcButton
				variant="primary"
				wide
				:disabled="!isDirty"
				@click="save">
				{{ t('talk_desktop', 'Set user status') }}
			</NcButton>
		</div>
	</div>
</template>

<style scoped lang="scss">
.user-status-form {
	margin: 0 var(--default-grid-baseline) calc(4 * var(--default-grid-baseline)) var(--default-grid-baseline);

	h3 {
		font-size: 16px;
		margin: calc(var(--default-grid-baseline) * 3) 0;
		color: var(--color-text-light);
		text-align: center;
		font-weight: bold;
	}

	h4 {
		margin: calc(var(--default-grid-baseline) * 2) 0 0 0;
		color: var(--color-text-light);
		font-weight: bold;
		text-align: center;
	}
}

.user-status-form__row {
	margin: calc(3 * var(--default-grid-baseline)) 0;
}

.user-status-form__predefined-statuses {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	gap: 2px; // Same as outline width
}

.user-status-form__buttons{
	margin-top: calc(var(--default-grid-baseline) * 2);
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
	gap: var(--default-grid-baseline);
}
</style>
