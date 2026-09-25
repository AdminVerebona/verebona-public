<template>
  <template v-for="(s, i) in inlines" :key="i">
    <strong v-if="s.kind === 'strong'">{{ s.text }}</strong>
    <a v-else-if="s.kind === 'link' && isInternal(s.href)" v-bind="link(s.href)">{{ s.text }}</a>
    <a v-else-if="s.kind === 'link'" :href="s.href" rel="noopener noreferrer">{{ s.text }}</a>
    <template v-else>{{ s.text }}</template>
  </template>
</template>

<script setup lang="ts">
/** Texte en ligne d'un article : gras et liens, jamais de HTML brut. */
import type { Inline } from '../../help/types'
import { useNav } from '../../composables/useNav'

defineProps<{ inlines: Inline[] }>()
const { link } = useNav()
const isInternal = (href: string) => href.startsWith('/') && !href.startsWith('//')
</script>
