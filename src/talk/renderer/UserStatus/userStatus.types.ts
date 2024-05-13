/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export type UserStatusStatusType = 'online' | 'away' | 'dnd' | 'invisible' | 'offline';

export type UserStatusBase = {
	/** So-called status type or online status */
	status: UserStatusStatusType,
	/** The id of the user */
	userId: string,
	/** Whether the status is user-defined with a custom message/icon */
	statusIsUserDefined: boolean,
	/** A custom message set by the user */
	message: string|null,
	/** The emoji symbol selected by the user */
	icon: string|null,
	/** When to automatically remove the status */
	clearAt: number|null,
	/** Whether the message is predefined */
	messageIsPredefined: boolean,
	/** The id of the message in case it's predefined */
	messageId: string|null,
}

export type UserStatusCustomBase = UserStatusBase & {
	statusIsUserDefined: true,
	messageIsPredefined: false,
	messageId: null,
}

export type UserStatusCustomWithIcon = UserStatusCustomBase & {
	message: string | null,
	icon: string,
}

export type UserStatusCustomWithMessage = UserStatusCustomBase & {
	message: string,
	icon: string | null,
}

export type UserStatusCustom = UserStatusCustomWithIcon | UserStatusCustomWithMessage;

export type UserStatusPredefined = UserStatusBase & {
	statusIsUserDefined: true,
	messageIsPredefined: true,
	messageId: string,
}

export type UserStatusNonCustom = UserStatusBase & {
	statusIsUserDefined: false,
	message: null,
	icon: null,
	clearAt: null,
	messageIsPredefined: false,
	messageId: null,
}

export type UserStatus = UserStatusCustom | UserStatusPredefined | UserStatusNonCustom;

export type UserStatusPrivate = Omit<UserStatus, 'messageId' | 'messageIsPredefined' | 'statusIsUserDefined'>

/**
 * The configuration for the predefined status message clearAt field
 */

export type ClearAtPredefinedConfigForEndOf = {
	type: 'end-of',
	time: 'week' | 'day',
}

export type ClearAtPredefinedConfigForTime = {
	type: 'period',
	/** The time in seconds until clear */
	time: number,
}

export type ClearAtPredefinedConfig = ClearAtPredefinedConfigForEndOf | ClearAtPredefinedConfigForTime;

export type PredefinedUserStatus = {
	id: string,
	icon: string,
	message: string,
	clearAt: ClearAtPredefinedConfig,
}
