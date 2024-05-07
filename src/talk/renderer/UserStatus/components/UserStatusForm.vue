<!--
  - @copyright Copyright (c) 2024 Grigorii Shartsev <me@shgk.me>
  -
  - @author Grigorii Shartsev <me@shgk.me>
  -
  - @license AGPL-3.0-or-later
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -->

<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import NcNoteCard from '@nextcloud/vue/dist/Components/NcNoteCard.js'
import { translate as t } from '@nextcloud/l10n'
import { useUserStatusStore } from '../userStatus.store.js'
import UserStatusFormClearAt from './UserStatusFormClearAt.vue'
import UserStatusFormCustomMessage from './UserStatusFormCustomMessage.vue'
import UserStatusFormStatusType from './UserStatusFormStatusType.vue'
import UserStatusFormPredefinedOption from './UserStatusFormPredefinedOption.vue'
import { convertPredefinedStatusToUserStatus } from '../userStatus.utils.js'

const emit = defineEmits(['submit'])

const userStatusStore = useUserStatusStore()

/** @type {import('vue').Ref<import('./userStatus.types.ts').UserStatus>} */
const userStatus = ref({ ...userStatusStore.userStatus })

const backupStatus = ref(userStatusStore.backupStatus ? { ...userStatusStore.backupStatus } : null)

const isDirty = ref(false)

const { predefinedStatuses } = storeToRefs(userStatusStore)

const statusIsUserDefined = computed(() => userStatus.value.icon || userStatus.value.message)

const isClear = computed(() => userStatus.value.status === 'online' && !userStatus.value.icon && !userStatus.value.message)

const patchStatus = (newUserStatus) => {
	isDirty.value = true
	backupStatus.value = null
	Object.assign(userStatus.value, newUserStatus)
}

const selectPredefinedStatus = (status) => {
	patchStatus(convertPredefinedStatusToUserStatus(status))
}

const clearUserStatusCustomMessage = () => {
	patchStatus({
		messageId: null,
		messageIsPredefined: false,
		message: null,
		icon: null,
		clearAt: null,
	})
}

const save = async () => {
	const isSuccess = await userStatusStore.saveUserStatus(userStatus.value)
	if (isSuccess) {
		emit('submit')
	}
}

const revertStatus = async () => {
	await userStatusStore.revertUserStatusFromBackup()
	backupStatus.value = null
	userStatus.value = { ...userStatusStore.userStatus }
	isDirty.value = true
}
</script>

<template>
	<div class="user-status-form">
		<UserStatusFormStatusType class="user-status-form__row" :status="userStatus.status" @update:status="patchStatus({ status: $event })" />

		<NcNoteCard v-if="backupStatus" type="info" class="user-status-form__row">
			{{ t('talk_desktop', 'Your status was set automatically') }}
		</NcNoteCard>

		<UserStatusFormCustomMessage class="user-status-form__row"
			:disabled="backupStatus"
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
			<UserStatusFormPredefinedOption v-for="status in predefinedStatuses"
				:key="status.id"
				:pressed="userStatus.messageId === status.id"
				:user-status="status"
				@click="selectPredefinedStatus(status)" />
		</div>

		<UserStatusFormClearAt class="user-status-form__row"
			:disabled="isClear"
			:clear-at="userStatus.clearAt"
			@update:clearAt="patchStatus({ clearAt: $event })" />

		<NcButton class="user-status-form__row"
			type="secondary"
			wide
			:disabled="!statusIsUserDefined"
			@click="clearUserStatusCustomMessage">
			{{ t('talk_desktop', 'Clear custom status') }}
		</NcButton>

		<div class="user-status-form__buttons">
			<NcButton type="primary" :disabled="!isDirty" @click="save">
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
