/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Vue from 'vue'
import type { DefineComponent, Component, ComponentInstance } from 'vue'

/**
 * Create a custom element for a settings section from a Vue component
 * @param component - Vue component to use as a settings section
 */
export function createSettingsSectionElement(component: Component): CustomElementConstructor & { tagName: string } {
	class SettingsSectionElement extends HTMLElement {

		static tagName = 'talk-desktop-settings-section-' + Math.random().toString(36).substring(6)

		vm: ComponentInstance
		rootElement: HTMLElement
		isMounted: boolean = false

		constructor() {
			super()
			this.rootElement = document.createElement('div')
			const ComponentConstructor = Vue.extend(component as DefineComponent)
			this.vm = new ComponentConstructor()
		}

		connectedCallback() {
			if (this.isMounted) {
				return
			}
			this.isMounted = true
			this.appendChild(this.rootElement)
			this.vm.$mount(this.rootElement)
		}

	}

	window.customElements.define(SettingsSectionElement.tagName, SettingsSectionElement)

	return SettingsSectionElement
}
