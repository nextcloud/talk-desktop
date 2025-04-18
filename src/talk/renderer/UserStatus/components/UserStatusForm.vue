<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { PredefinedUserStatus, UserStatusPrivate } from '../userStatus.types.ts'
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcNoteCard from '@nextcloud/vue/components/NcNoteCard'
import { translate as t } from '@nextcloud/l10n'
import { useUserStatusStore } from '../userStatus.store.ts'
import UserStatusFormClearAt from './UserStatusFormClearAt.vue'
import UserStatusFormCustomMessage from './UserStatusFormCustomMessage.vue'
import UserStatusFormStatusType from './UserStatusFormStatusType.vue'
import UserStatusFormPredefinedOption from './UserStatusFormPredefinedOption.vue'
import { convertPredefinedStatusToUserStatus } from '../userStatus.utils.ts'

const emit = defineEmits<{
	(event: 'submit'): void
}>()

const userStatusStore = useUserStatusStore()
const userStatus = ref<UserStatusPrivate>({ ...userStatusStore.userStatus! })
const backupStatus = ref(userStatusStore.backupStatus ? { ...userStatusStore.backupStatus } : null)

const isDirty = ref(false)

const { predefinedStatuses } = storeToRefs(userStatusStore)

const statusIsUserDefined = computed(() => userStatus.value.icon || userStatus.value.message)
const isClear = computed(() => userStatus.value.status === 'online' && !userStatus.value.icon && !userStatus.value.message)

/**
 * Patch the user status with the new values
 *
 * @param newUserStatus - New user status values
 */
function patchStatus(newUserStatus: Partial<UserStatusPrivate>) {
	isDirty.value = true
	backupStatus.value = null
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
	backupStatus.value = null
	userStatus.value = { ...userStatusStore.userStatus! }
	isDirty.value = true
}
</script>

<template>
	<div class="user-status-form">
		<UserStatusFormStatusType class="user-status-form__row" :status="userStatus.status" @update:status="patchStatus({ status: $event })" />

		<NcNoteCard v-if="backupStatus" type="info" class="user-status-form__row">
			{{ t('talk_desktop', 'Your status was set automatically') }}
		</NcNoteCard>

		<UserStatusFormCustomMessage
			class="user-status-form__row"
			:disabled="!!backupStatus"
			:message="userStatus.message"
			:icon="userStatus.icon"
			@update:message="patchStatus({ message: $event })"
			@update:icon="patchStatus({ icon: $event })" />

		<template v-if="backupStatus">
			<h4>{{ t('talk_desktop', 'Previously set status') }}</h4>
			<UserStatusFormPredefinedOption key="previously-set" :user-status="backupStatus" @click="revertStatus" />
		</template>

		<h4 v-if="backupStatus">
			{{ t('talk_desktop', 'Predefined statuses') }}
		</h4>

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
			@update:clearAt="patchStatus({ clearAt: $event })" />

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
