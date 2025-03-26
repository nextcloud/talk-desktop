/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getCanonicalLocale } from '@nextcloud/l10n'

const locale = getCanonicalLocale()

const relativeTimeFormat = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

/**
 * Format duration in human-readable format.
 * If the unit is not provided, the largest unit is used for rounded duration in milliseconds.
 *
 * @param duration - Duration in the unit
 * @param unit - Unit to format to
 */
export function formatDuration(duration: number, unit?: Intl.RelativeTimeFormatUnit) {
	if (!unit) {
		const { value, unit: largestUnit } = convertMsToLargestTimeUnit(duration)
		duration = value
		unit = largestUnit
	}

	return new Intl.NumberFormat(locale, { style: 'unit', unit, unitDisplay: 'long' }).format(duration)
}

/**
 * Format duration in human-readable format from now.
 * If the unit is not provided, the largest unit is used for rounded duration in milliseconds.
 *
 * @param dateOrMs - Date or ms to format
 * @param unit - Unit to format to
 */
export function formatDurationFromNow(dateOrMs: Date | number, unit?: Intl.RelativeTimeFormatUnit) {
	return formatDuration(+new Date(dateOrMs) - Date.now(), unit)
}

/**
 * Format relative time duration in human-readable format
 *
 * @param ms - Duration in milliseconds
 */
export function formatRelativeTime(ms: number) {
	const { value, unit } = convertMsToLargestTimeUnit(ms)

	return relativeTimeFormat.format(value, unit)
}

/**
 * Format relative time duration in human-readable format from now
 *
 * @param dateOrMs - Date or ms to format
 */
export function formatRelativeTimeFromNow(dateOrMs: Date | number) {
	return formatRelativeTime(+new Date(dateOrMs) - Date.now())
}

/**
 * Convert milliseconds to the largest unit rounded from 0.75 point.
 *
 * @example 123 -> { value: 0, unit: 'second' }
 * @example 1000 -> { value: 1, unit: 'second' }
 * @example 25 * 60 * 60 * 1000 -> { value: 25, unit: 'minute' }
 * @example 35 * 60 * 60 * 1000 -> { value: 35, unit: 'minute' }
 * @example 45 * 60 * 60 * 1000 -> { value: 1, unit: 'hour' }
 * @example 3600000 -> { value: 1, unit: 'hour' }
 * @example 86400000 -> { value: 1, unit: 'day' }
 * @param ms - Duration in milliseconds
 */
export function convertMsToLargestTimeUnit(ms: number): { value: number, unit: Intl.RelativeTimeFormatUnit } {
	const units = {
		year: 0,
		month: 0,
		day: 0,
		hour: 0,
		minute: 0,
		second: 0,
	}

	units.second = ms / 1000
	units.minute = units.second / 60
	units.hour = units.minute / 60
	units.day = units.hour / 24
	units.month = units.day / 30
	units.year = units.day / 365

	//
	const round = (value: number) => Math.abs(value % 1) < 0.75 ? Math.trunc(value) : Math.round(value)

	// Loop from the largest unit to the smallest
	for (const key in units) {
		const unit = key as keyof typeof units
		// Round the value so 59 min 59 sec 999 ms is 1 hour and not 59 minutes
		const rounded = round(units[unit])
		// Return the first non-zero unit
		if (rounded !== 0) {
			return {
				value: rounded,
				unit,
			}
		}
	}

	// now
	return {
		value: 0,
		unit: 'second',
	}
}
