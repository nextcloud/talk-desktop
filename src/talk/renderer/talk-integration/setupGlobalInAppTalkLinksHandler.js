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

import { getBaseUrl } from '@nextcloud/router'

/**
 * Get Talk route for a given absolute URL or null if it's not a Talk route of the current instance
 *
 * @param {import('vue-router')} router - Talk's VueRouter instance
 * @param {string} url - Absolute URL on this server instance
 * @return {import('vue-router').Route | null} - Route or null if it's not a Talk route
 */
function getTalkRoute(router, url) {
	const pathWithoutBase = url.replace(getBaseUrl(), '')
	const pathWithoutIndexPhp = pathWithoutBase.startsWith('/index.php') ? pathWithoutBase.replace('/index.php', '') : pathWithoutBase

	const resolvedRoute = router.resolve(pathWithoutIndexPhp).route

	if (resolvedRoute.matched.length) {
		return resolvedRoute
	}

	return null
}

/**
 * Intercept into link click handling to navigate via router whenever possible
 *
 * @param {import('vue-router')} router - Talk's VueRouter instance
 */
export function setupGlobalInAppTalkLinksHandler(router) {
	document.addEventListener('click', (event) => {
		const link = event.target.closest('a')

		// Handle only click on links
		if (!link) {
			return
		}

		// Handle only exact clicks
		if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
			return
		}

		const url = link.href

		// Handle only absolute links to the current server instance. They have a chance to be an internal Talk link
		if (!url.startsWith(getBaseUrl())) {
			return null
		}

		// Check if the link is a Talk route
		const resolvedRoute = getTalkRoute(router, link.href)
		if (resolvedRoute) {
			event.preventDefault()
			router.push(resolvedRoute)
		}
	}, { capture: true })
}
