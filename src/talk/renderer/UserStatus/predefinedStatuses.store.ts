/*!
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { PredefinedUserStatus } from './userStatus.types.ts'

import { defineStore } from 'pinia'
import { browserStorage } from '../../../shared/browserStorage.service.ts'
import { useBrowserStorage } from '../../../shared/useBrowserStorage.ts'
import { fetchAllPredefinedStatuses } from './userStatus.service.ts'

export const usePredefinedStatusesStore = defineStore('predefinedStatuses', () => {
	const predefinedStatuses = useBrowserStorage<PredefinedUserStatus[] | null>(browserStorage, 'predefinedStatuses', null)

	const initPromise = fetchAllPredefinedStatuses().then((statuses) => {
		predefinedStatuses.value = statuses
	})

	return {
		initPromise,
		predefinedStatuses,
	}
})
