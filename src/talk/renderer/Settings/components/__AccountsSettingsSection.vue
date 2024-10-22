<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import { t } from '@nextcloud/l10n'
import NcActionButton from '@nextcloud/vue/dist/Components/NcActionButton.js'
import NcAvatar from '@nextcloud/vue/dist/Components/NcAvatar.js'
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import NcListItem from '@nextcloud/vue/dist/Components/NcListItem.js'
import IconAccountMultiplePlus from 'vue-material-design-icons/AccountMultiplePlus.vue'
import IconDelete from 'vue-material-design-icons/Delete.vue'
import SettingsSubsection from './SettingsSubsection.vue'
</script>

<template>
	<SettingsSubsection>
		<ul>
			<NcListItem name="Grigorii K. Shartsev" details="nextcloud.local">
				<template #icon>
					<NcAvatar user="shgkme" />
				</template>
				<template #subname>
					me@shgk.me
				</template>
				<template #actions>
					<NcActionButton>
						<template #icon>
							<IconDelete :size="20" />
						</template>
						{{ t('talk_desktop', 'Remove') }}
					</NcActionButton>
				</template>
			</NcListItem>
			<NcListItem name="admin" details="stable30.local">
				<template #icon>
					<NcAvatar user="admin" />
				</template>
				<template #subname>
					admin@example.net
				</template>
				<template #actions>
					<NcActionButton>
						<template #icon>
							<IconDelete :size="20" />
						</template>
						{{ t('talk_desktop', 'Remove') }}
					</NcActionButton>
				</template>
			</NcListItem>
		</ul>
		<NcButton wide>
			<template #icon>
				<IconAccountMultiplePlus :size="20" />
			</template>
			{{ t('talk_desktop', 'Log into a new account') }}
		</NcButton>
	</SettingsSubsection>
</template>
