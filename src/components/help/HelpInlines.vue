<template>
  <template v-for="(s, i) in inlines" :key="i">
    <strong v-if="s.kind === 'strong'">{{ s.text }}</strong>
    <a v-else-if="s.kind === 'link' && isInternal(s.href)" v-bind="link(s.href)">{{ s.text }}</a>
    <a v-else-if="s.kind === 'link'" :href="s.href" rel="noopener noreferrer" :target="embedded ? '_blank' : undefined">{{ s.text }}</a>
    <template v-else>{{ s.text }}</template>
  </template>
</template>

<script setup lang="ts">
/**
 * Texte en ligne d'un article : gras et liens, jamais de HTML brut.
 *
 * Mode intégré (§1.1) : un lien externe s'ouvre hors du cadre ou de la
 * WebView de l'application (`target="_blank"`), sans remplacer l'aide.
 */
import type { Inline } from '../../help/types'
import { useNav } from '../../composables/useNav'
import { useEmbed } from '../../help/embed'

defineProps<{ inlines: Inline[] }>()
const { link } = useNav()
const { embedded } = useEmbed()
const isInternal = (href: string) => href.startsWith('/') && !href.startsWith('//')
</script>
