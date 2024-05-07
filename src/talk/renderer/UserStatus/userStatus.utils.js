/*
 * @copyright Copyright (c) 2024 Grigorii Shartsev <me@shgk.me>
 *
 * @author Grigorii Shartsev <me@shgk.me>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import moment from '@nextcloud/moment'
import { translate as t } from '@nextcloud/l10n'

/** @type {Record<import('./userStatus.types.ts').UserStatusStatusType, string>} */
export const userStatusTranslations = {
	online: t('talk_desktop', 'Online'),
	away: t('talk_desktop', 'Away'),
	busy: t('talk_desktop', 'Away'),
	dnd: t('talk_desktop', 'Do not disturb'),
	invisible: t('talk_desktop', 'Invisible'),
	offline: t('talk_desktop', 'Offline'),
}

/**
 * Get a human-readable string for the user status
 *
 * @param {import('./userStatus.types.ts').UserStatus} userStatus - The user status
 */
export function getVisibleUserStatus(userStatus) {
	if (!userStatus) {
		return ''
	}

	if (userStatus.icon || userStatus.message) {
		return [userStatus.icon, userStatus.message].join(' ')
	}

	return userStatusTranslations[userStatus.status] ?? t('talk_desktop', 'Unknown status')
}

/**
 * Convert predefined clearAt config into UserStatus.clearAt value
 *
 * @param {import('./userStatus.types.ts').ClearAtPredefinedConfig|number|null} clearAt - The clear-at config
 * @return {number|null} - The UNIX timestamp in seconds or null if not defined
 */
export function getTimestampForPredefinedClearAt(clearAt) {
	if (!clearAt) {
		return null
	}

	if (typeof clearAt === 'number') {
		return clearAt
	}

	if (clearAt.type === 'period') {
		const date = new Date()
		date.setSeconds(date.getSeconds() + clearAt.time)
		return Math.floor(date.getTime() / 1000)
	}

	if (clearAt.type === 'end-of') {
		switch (clearAt.time) {
		case 'day':
		case 'week':
			return Number(moment(new Date()).endOf(clearAt.time).format('X'))
		}
	}

	// Unknown type
	return null
}

/**
 * Convert clearAt config to human-readable label
 *
 * @param {import('./userStatus.types.ts').ClearAtPredefinedConfig|number|null} clearAt - The clearAt config
 * @return {string} - human-readable string
 */
export function clearAtToLabel(clearAt) {
	// Clear At is not set
	if (!clearAt) {
		return t('talk_desktop', 'Don\'t clear')
	}

	// Clear At has been already set
	if (typeof clearAt === 'number') {
		const momentNow = moment(new Date())
		const momentClearAt = moment(new Date(clearAt * 1000))
		return moment.duration(momentNow.diff(momentClearAt)).humanize()
	}

	// ClearAt is an object description of predefined value
	if (clearAt.type === 'end-of') {
		const endOfTranslations = {
			day: t('talk_desktop', 'Today'),
			week: t('talk_desktop', 'This week'),
		}
		return endOfTranslations[clearAt.time] ?? ''
	}

	// ClearAt is an object description of predefined value
	if (clearAt.type === 'period') {
		return moment.duration(clearAt.time * 1000).humanize()
	}

	return ''
}

/**
 * Convert a predefined status into a user status
 *
 * @param {import('./userStatus.types.ts').PredefinedUserStatus} predefinedStatus - The predefined status
 * @return {Partial<import('./userStatus.types.ts').UserStatus>} - The user status
 */
export function convertPredefinedStatusToUserStatus(predefinedStatus) {
	return {
		icon: predefinedStatus.icon,
		message: predefinedStatus.message,
		clearAt: getTimestampForPredefinedClearAt(predefinedStatus.clearAt),
		messageId: predefinedStatus.id,
		messageIsPredefined: true,
	}
}
