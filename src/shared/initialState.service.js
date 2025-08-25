/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Escape unicode characters in string with \\u{code}
 *
 * @param {string} str - source string
 * @return {string} - string with escaped unicode characters
 */
function escapeUnicode(str) {
	return str.split('').map((char) => {
		const codePoint = char.codePointAt(0)
		if (codePoint <= 0x7F) {
			return char
		} else if (codePoint <= 0xFFFF) {
			return '\\u' + codePoint.toString(16).padStart(4, '0')
		} else {
			return '\\u{' + codePoint.toString(16) + '}'
		}
	}).join('')
}

/**
 * Find or create and add to body if not exists a container for initial state input elements
 *
 * @return {HTMLTemplateElement} - the container template element
 */
function findOrCreateInitialStateContainer() {
	let container = document.getElementById('initial-state')

	if (!container) {
		// <template id="initial-state"></template>
		container = document.createElement('template')
		container.id = 'initial-state'
		document.body.prepend(container)
	}

	return container
}

/**
 * Find or create an input element for initial state data
 *
 * @param {string} app - application name
 * @param {string} key - state key
 * @param {HTMLElement} [container] - the container element with all items
 * @return {HTMLInputElement} - the input element
 */
function findOrCreateInitialStateElement(app, key, container = document.body) {
	let input = container.querySelector(`#initial-state-${app}-${key}`)
	if (!input) {
		// <input id="initial-state-{app}-{key}" type="hidden" />
		input = document.createElement('input')
		input.id = `initial-state-${app}-${key}`
		input.type = 'hidden'
		container.appendChild(input)
	}
	return input
}

/**
 * Set initial state data for app
 *
 * @param {string} app - application name
 * @param {string} key - state key
 * @param {any} data - serializable state data
 * @param {HTMLElement} [container] - the container element with all items
 */
export function setInitialState(app, key, data, container) {
	const input = findOrCreateInitialStateElement(app, key, container)
	input.value = btoa(escapeUnicode(JSON.stringify(data)))
}

/**
 * Initialize initial state data for all apps and keys from initial object
 *
 * @param {Record<string,Record<string,any>>} initialState - initial state data
 */
export function setupInitialState(initialState) {
	const container = findOrCreateInitialStateContainer()

	for (const [app, appInitialState] of Object.entries(initialState)) {
		for (const [key, data] of Object.entries(appInitialState)) {
			if (data !== undefined) {
				setInitialState(app, key, data, container)
			}
		}
	}
}
