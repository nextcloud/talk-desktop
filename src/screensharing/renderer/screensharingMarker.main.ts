/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { BUILD_CONFIG } from '../../shared/build.config.ts'

import './screensharingMarker.css'

// The marker is rendered on top of arbitrary content, use the brand color to make it recognizable
document.documentElement.style.setProperty('--marker-color', BUILD_CONFIG.brandColor)
