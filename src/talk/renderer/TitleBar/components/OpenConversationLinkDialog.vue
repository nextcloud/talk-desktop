<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import axios from '@nextcloud/axios'
import { t } from '@nextcloud/l10n'
import { generateOcsUrl, generateUrl } from '@nextcloud/router'
import { ref, watch } from 'vue'
import NcDialog from '@nextcloud/vue/components/NcDialog'
import NcTextField from '@nextcloud/vue/components/NcTextField'
import { appData } from '../../../../app/AppData.js'
import { openConversation } from '../../TalkWrapper/talk.service.ts'
import { parseConversationToken } from '../../utils/parseConversationToken.ts'

const emit = defineEmits<{
	close: []
}>()

const placeholder = generateUrl('/call/…', {}, { baseURL: appData.serverUrl! })

const url = ref('')

const parsedToken = ref({ error: '', token: '' })

watch(url, () => {
	parsedToken.value = parseConversationToken(url.value)
})

/** Handle prompt submit */
async function onSubmit() {
	if (!parsedToken.value.token) {
		return false
	}

	try {
		await axios.get(generateOcsUrl('/apps/spreed/api/v4/room/{token}', { token: parsedToken.value.token }))
	} catch {
		parsedToken.value = { error: t('talk_desktop', 'Conversation not found'), token: '' }
		return false
	}

	await openConversation(parsedToken.value.token)
	return true
}
</script>

<template>
	<NcDialog
		open
		:name="t('talk_desktop', 'Open conversation link')"
		size="normal"
		:buttons="[{
			label: t('talk_desktop', 'Cancel'),
		}, {
			label: t('talk_desktop', 'Open'),
			variant: 'primary',
			type: 'submit',
			disabled: !parsedToken.token,
			callback: onSubmit,
		}]"
		close-on-click-outside
		@close="emit('close')">
		<NcTextField
			v-model="url"
			:label="t('talk_desktop', 'Conversation URL')"
			:placeholder
			type="url"
			:helper-text="parsedToken.error"
			:success="!!parsedToken.token"
			:error="!!parsedToken.error"
			@keydown.enter="onSubmit" />
	</NcDialog>
</template>
