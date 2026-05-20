/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { MaybeRefOrGetter, Ref } from 'vue'

import { computed, toValue } from 'vue'

/**
 * Use a toggle for a tristate value with a "default" or "auto-resolved" option:
 * - For the end user this is a boolean toggle - either enabled or disabled
 * - Internally it is tristate value with a third value meaning "default" or some externally resolved, auto option
 * - Internal value is only non-default when a user explicitly toggle from the auto-resolved default to customize, override the default
 *
 * This allows providing a user with a simple "change the default" toggle while keeping the internal complexity with the "default" hidden.
 *
 * A classic example is the "dark mode":
 * - By default any app must just follow the system
 * - When the color scheme is correct the user does not go to settings to see that "Follow system" is chosen
 * - The user only go to the setting when the default is wrong and must be TOGGLED. "It is light - the user wants dark".
 * - The user does not need to know the internal complexity of 3 states with a technical "system default" value
 * - A toggle can be a simple, even an icon only switch while a tristate requires a radio group with labels
 *
 * @param tristate - Internal tristate value
 * @param defaultToggleValue - The toggle value reflecting the default
 * @param tristateOptions - Tristate options in the order of [default, true, false]
 * @param tristateOptions.0 - Tristate option meaning "default", e.g. "default", "auto" or "system"
 * @param tristateOptions.1 - Tristate option meaning "true" for the toggle, e.g. "enabled" or "on"
 * @param tristateOptions.2 - Tristate option meaning "false" for the toggle, e.g. "disabled" or "off"
 * @return Toggle value as a proxy to the tristate value
 */
export function useTristateToggle<DefaultOption extends string, TrueOption extends string, FalseOption extends string>(
	tristate: Ref<DefaultOption | TrueOption | FalseOption>,
	defaultToggleValue: MaybeRefOrGetter<boolean>,
	[defaultOption, trueOption, falseOption]: [DefaultOption, TrueOption, FalseOption],
) {
	return computed<boolean>({
		get: () => {
			return tristate.value === defaultOption
				? toValue(defaultToggleValue)
				: tristate.value === trueOption
		},
		set: (toggleValue: boolean) => {
			tristate.value = toggleValue === toValue(defaultToggleValue)
				? defaultOption
				: (toggleValue ? trueOption : falseOption)
		},
	})
}
