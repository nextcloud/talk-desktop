/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Component, ComponentInstance, DefineComponent } from 'vue'

import Vue from 'vue'

/**
 * Create a custom element from a Vue component
 *
 * @param name - Name of the element
 * @param component - Vue component to use as a settings section
 */
export function createCustomElement(name: string, component: Component): CustomElementConstructor & { tagName: string } {
	class CustomElement extends HTMLElement {
		static tagName = name + '-' + Math.random().toString(36).substring(6)

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

	window.customElements.define(CustomElement.tagName, CustomElement)

	return CustomElement
}
