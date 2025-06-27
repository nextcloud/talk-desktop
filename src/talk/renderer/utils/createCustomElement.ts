/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { defineCustomElement } from 'vue'

/**
 * Create a custom element from a Vue component
 *
 * @param name - Name of the element
 * @param component - Vue component to use as a settings section
 */
export function createCustomElement(name: string, component: Parameters<typeof defineCustomElement>[0]): string {
	const customElementName = name + '-' + Math.random().toString(36).substring(6)
	const CustomElement = defineCustomElement(component, { shadowRoot: false })
	window.customElements.define(customElementName, CustomElement)
	return customElementName
}
