<template>
  <template v-for="(b, i) in blocks" :key="i">
    <ul v-if="b.kind === 'list'">
      <li v-for="(it, j) in b.items" :key="j"><HelpInlines :inlines="it" /></li>
    </ul>
    <template v-else-if="b.kind === 'table'">
      <div class="rs-table" role="region" tabindex="0" :aria-label="`Tableau : ${b.head.join(', ')}`">
        <table>
          <thead><tr><th v-for="(h, j) in b.head" :key="j" scope="col">{{ h }}</th></tr></thead>
          <tbody><tr v-for="(r, j) in b.rows" :key="j"><td v-for="(c, k) in r" :key="k">{{ c }}</td></tr></tbody>
        </table>
      </div>
      <p class="rs-table-hint" aria-hidden="true">Faites glisser le tableau horizontalement pour voir toutes les colonnes.</p>
    </template>
    <p v-else><HelpInlines :inlines="b.inlines" /></p>
  </template>
</template>

<script setup lang="ts">
/**
 * Blocs d'un article Ressources : paragraphes, listes, tableaux.
 *
 * Pas de `v-html` (ADM-09, SEC-03) : texte, gras et liens seulement. Un
 * tableau large défile horizontalement dans son cadre, au clavier compris
 * (région focalisable étiquetée, UX-07), avec une indication sur mobile (§9).
 */
import type { RessourceBlock } from '../../ressources/types'
import HelpInlines from '../help/HelpInlines.vue'

defineProps<{ blocks: RessourceBlock[] }>()
</script>
