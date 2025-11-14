<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
  -->

<script setup lang="ts">
import { t } from '@nextcloud/l10n'
import { computed } from 'vue'
import NcDialog from '@nextcloud/vue/components/NcDialog'

const { url } = defineProps<{
	url: string
}>()

const emit = defineEmits<{
	close: [isAccepted: boolean]
}>()

const open = () => emit('close', true)
const cancel = () => emit('close', false)

const urlParts = computed(() => {
	const urlObject = new URL(url)
	const protocol = urlObject.protocol + '//'
	const hostname = urlObject.hostname
	const rest = url.slice(protocol.length + hostname.length)
	return {
		protocol,
		hostname,
		rest,
	}
})
</script>

<template>
	<NcDialog
		:name="t('talk_desktop', 'Open external link?')"
		size="small"
		:buttons="[{
			label: t('talk_desktop', 'Cancel'),
			callback: cancel,
		}, {
			label: t('talk_desktop', 'Open'),
			variant: 'primary',
			callback: open,
		}]"
		close-on-click-outside
		@close="cancel">
		<div class="url">
			<span class="url__protocol">{{ urlParts.protocol }}</span>
			<span class="url__hostname">{{ urlParts.hostname }}</span>
			<span class="url__rest">{{ urlParts.rest }}</span>
		</div>
	</NcDialog>
</template>

<style scoped>
.url {
	border: 1px solid var(--color-border-maxcontrast);
	border-radius: var(--border-radius-small);
	padding-block: calc(1 * var(--default-grid-baseline));
	padding-inline: calc(2 * var(--default-grid-baseline));
}

.url__protocol,
.url__rest {
	color: var(--color-text-maxcontrast);
}

.url__hostname {
	font-weight: bold;
}
</style>
