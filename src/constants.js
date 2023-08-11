/*
 * @copyright Copyright (c) 2022 Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
 *
 * @author Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
 *
 * @license GNU AGPL version 3 or any later version
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
const MIN_REQUIRED_BUILT_IN_TALK_VERSION = '17.0.0'

module.exports = {
	BASE_TITLE,
	USER_AGENT,
	DEV_SERVER_ORIGIN,
	MIN_REQUIRED_NEXTCLOUD_VERSION,
	MIN_REQUIRED_TALK_VERSION,
	MIN_REQUIRED_BUILT_IN_TALK_VERSION,
}
