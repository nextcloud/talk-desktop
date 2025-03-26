/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export type UserStatusStatusType = 'online' | 'away' | 'busy' | 'dnd' | 'invisible' | 'offline'

/** Generic User Status - base for different cases */
type UserStatusBase = {
	/** The id of the user */
	userId: string
	/** So-called status type or online status */
	status: UserStatusStatusType
	/** Whether the status is user-defined with a custom message/icon */
	statusIsUserDefined: boolean
	/** Custom message set by the user */
	message: string | null
	/** Custom emoji symbol selected by the user */
	icon: string | null
	/** When to automatically remove the status */
	clearAt: number | null
	/** Whether the message is predefined */
	messageIsPredefined: boolean
	/** ID of the predefined message */
	messageId: string | null
}

/** User Status without any additional values except the status type */
type UserStatusClean = UserStatusBase & {
	statusIsUserDefined: false
	message: null
	icon: null
	clearAt: null
	messageIsPredefined: false
	messageId: null
}

/** User Status set by user with at least a custom icon or message */
type UserStatusCustom = UserStatusBase & {
	statusIsUserDefined: true
	messageIsPredefined: false
	messageId: null
} & ({ icon: string } | { message: string })

/** User Status set from predefined statuses */
type UserStatusPredefined = UserStatusBase & {
	statusIsUserDefined: true
	messageIsPredefined: true
	messageId: string
}

export type UserStatusPrivate = UserStatusCustom | UserStatusPredefined | UserStatusClean

export type UserStatusPublic = Pick<UserStatusPrivate, 'userId' | 'message' | 'icon' | 'clearAt' | 'status'>

export type UserStatus = UserStatusPrivate | UserStatusClean

export type UserStatusBackup = UserStatusPublic & {
	userId: `_${string}`
}

/**
 * Configuration for the predefined status message clearAt field
 */

export type ClearAtPredefinedConfigForEndOf = {
	type: 'end-of'
	time: 'week' | 'day'
}

export type ClearAtPredefinedConfigForTime = {
	type: 'period'
	/** The time in seconds until clear */
	time: number
}

export type ClearAtPredefinedConfig = ClearAtPredefinedConfigForEndOf | ClearAtPredefinedConfigForTime

export type PredefinedUserStatus = {
	id: string
	icon: string
	message: string
	clearAt: ClearAtPredefinedConfig
}
