/*
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as assert from 'node:assert'
import { describe, it } from 'node:test'
import { createReuseToml, parseDep5, parseReuseToml } from '../utils/reuse.utils.mjs'

const dep5 = `Format: https://www.debian.org/doc/packaging-manuals/copyright-format/1.0/
Upstream-Name: nextcloud
Upstream-Contact: Nextcloud <info@nextcloud.com>
Source: https://github.com/nextcloud/server

# Transifex
Files: .tx/config
Copyright: 2011-2012 ownCloud, Inc., 2017-2023 Nextcloud GmbH and Nextcloud contributors
License: AGPL-3.0-only

Files: .htaccess
Copyright: 2011-2016 ownCloud, Inc., 2016-2024 Nextcloud GmbH and Nextcloud contributors
License: AGPL-3.0-only

Files: core/img/mastodon.svg core/img/actions/mastodon.svg
Copyright: 2024 Mastodon gGmbH
License: LicenseRef-MastodonTrademarks
`

const reuseToml = `version = 1
SPDX-PackageName = "nextcloud"
SPDX-PackageSupplier = "Nextcloud <info@nextcloud.com>"
SPDX-PackageDownloadLocation = "https://github.com/nextcloud/server"

[[annotations]]
path = ".tx/config"
precedence = "aggregate"
SPDX-FileCopyrightText = "2011-2012 ownCloud, Inc., 2017-2023 Nextcloud GmbH and Nextcloud contributors"
SPDX-License-Identifier = "AGPL-3.0-only"

[[annotations]]
path = ".htaccess"
precedence = "aggregate"
SPDX-FileCopyrightText = "2011-2016 ownCloud, Inc., 2016-2024 Nextcloud GmbH and Nextcloud contributors"
SPDX-License-Identifier = "AGPL-3.0-only"

[[annotations]]
path = ["core/img/mastodon.svg","core/img/actions/mastodon.svg"]
precedence = "aggregate"
SPDX-FileCopyrightText = "2024 Mastodon gGmbH"
SPDX-License-Identifier = "LicenseRef-MastodonTrademarks"
`

const reuseData = {
	prolog: {
		name: 'nextcloud',
		supplier: 'Nextcloud <info@nextcloud.com>',
		downloadLocation: 'https://github.com/nextcloud/server',
	},
	annotations: [
		{
			files: ['.tx/config'],
			copyright: '2011-2012 ownCloud, Inc., 2017-2023 Nextcloud GmbH and Nextcloud contributors',
			license: 'AGPL-3.0-only',
		},
		{
			files: ['.htaccess'],
			copyright: '2011-2016 ownCloud, Inc., 2016-2024 Nextcloud GmbH and Nextcloud contributors',
			license: 'AGPL-3.0-only',
		},
		{
			files: ['core/img/mastodon.svg', 'core/img/actions/mastodon.svg'],
			copyright: '2024 Mastodon gGmbH',
			license: 'LicenseRef-MastodonTrademarks',
		},
	],
}

describe('reuse.utils', () => {
	describe('parseDep5', () => {
		it('parses .dep5', () => {
			const parsed = parseDep5(dep5)
			assert.deepStrictEqual(parsed, reuseData)
		})
	})

	describe('parseReuseToml', () => {
		it('parses REUSE.toml', () => {
			const parsed = parseReuseToml(reuseToml)
			assert.deepStrictEqual(parsed, reuseData)
		})
	})

	describe('createReuseToml', () => {
		it('creates REUSE.toml from parsed reuse data', () => {
			assert.equal(createReuseToml(reuseData), reuseToml)
		})
	})
})
