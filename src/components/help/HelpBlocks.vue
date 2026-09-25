<template>
  <div class="ha-article">
    <template v-for="(b, i) in blocks" :key="i">
      <h2 v-if="b.kind === 'heading'" :id="b.anchor">{{ b.text }}</h2>
      <ol v-else-if="b.kind === 'steps'" class="ha-steps">
        <li v-for="(s, j) in b.items" :key="j"><strong>{{ s.title }}</strong> — <HelpInlines :inlines="s.body" /></li>
      </ol>
      <div v-else-if="b.kind === 'callout'" :class="['ha-callout', `ha-callout-${b.tone}`]" role="note">
        <strong>{{ b.label }}</strong>
        <HelpInlines :inlines="b.inlines" />
      </div>
      <p v-else-if="b.kind === 'definition'" class="ha-def"><strong>{{ b.term }}</strong> — <HelpInlines :inlines="b.inlines" /></p>
      <p v-else><HelpInlines :inlines="b.inlines" /></p>
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * Corps d'un article, rendu bloc par bloc.
 *
 * Pas de `v-html` : le contenu vient de fichiers revus, mais un défaut de
 * saisie ne doit jamais pouvoir se transformer en balisage exécuté.
 */
import type { Block } from '../../help/types'
import HelpInlines from './HelpInlines.vue'

defineProps<{ blocks: Block[] }>()
</script>
