/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
const packageJson = require('../package.json')
const { getOsTitle } = require('./shared/os.utils.js')

const BASE_TITLE = packageJson.productName
/**
 * @see https://github.com/nextcloud/server/blob/master/lib/public/IRequest.php
 * @example "Mozilla/5.0 (Mac) Nextcloud-Talk v1.2.3-rc.1
 * @example "Mozilla/5.0 (Linux) Nextcloud-Talk v0.0.1
 * @example "Mozilla/5.0 (Windows) Nextcloud-Talk v42.16.64
 */
const USER_AGENT = `Mozilla/5.0 (${getOsTitle()}) Nextcloud-Talk v${packageJson.version}`
const DEV_SERVER_ORIGIN = 'http://localhost:3000'
const MIN_REQUIRED_NEXTCLOUD_VERSION = 27
const MIN_REQUIRED_TALK_VERSION = 17
const MIN_REQUIRED_BUILT_IN_TALK_VERSION = '18.0.0'
const TITLE_BAR_HEIGHT = 34 + 2 * 4 + 2 * 2 // default-clickable-area + 2 * default-grid-baseline + 2 * focus outline-width
const ZOOM_MIN = 0.55
const ZOOM_MAX = 5

module.exports = {
	BASE_TITLE,
	USER_AGENT,
	DEV_SERVER_ORIGIN,
	MIN_REQUIRED_NEXTCLOUD_VERSION,
	MIN_REQUIRED_TALK_VERSION,
	MIN_REQUIRED_BUILT_IN_TALK_VERSION,
	TITLE_BAR_HEIGHT,
	ZOOM_MIN,
	ZOOM_MAX,
}
