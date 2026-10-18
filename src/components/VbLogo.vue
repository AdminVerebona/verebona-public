<template>
  <span class="vb-logo" :style="{ gap: `${Math.round(size * 0.35)}px` }">
    <svg :width="size" :height="size" viewBox="0 0 32 32" fill="none" style="overflow:visible" aria-hidden="true" focusable="false">
      <rect v-for="(c, i) in CELLS" :key="i" :x="c[0]" :y="c[1]" width="9.14" height="9.14" rx="1.6" :fill="cells" />
      <rect x="22.86" y="-1.55" width="9.14" height="9.14" rx="1.6" fill="#D66B53" transform="rotate(18 27.43 3.02)" />
    </svg>
    <span v-if="wordmark" class="vb-logo__word" :style="{ fontSize: `${Math.round(size * 0.65)}px`, color: word }">Verebona</span>
  </span>
</template>

<script setup lang="ts">
/**
 * Logo Verebona — charte 2026 §3 : grille 3 × 3 (8 cases + cube cuivre tourné
 * de 18°), géométrie historique du header public. Fond clair : cases et
 * mot-symbole pétrole ; fond sombre / pétrole (`inverse`) : cases ivoire.
 * Mot-symbole en Figtree 700, −0,02 em (point 9.2 de la charte à valider).
 */
import { computed } from 'vue'

const props = withDefaults(defineProps<{ size?: number; inverse?: boolean; wordmark?: boolean }>(), {
  size: 34,
  inverse: false,
  wordmark: true,
})

const CELLS: ReadonlyArray<readonly [number, number]> = [
  [0, 0], [11.43, 0], [0, 11.43], [11.43, 11.43], [22.86, 11.43], [0, 22.86], [11.43, 22.86], [22.86, 22.86],
]
const cells = computed(() => (props.inverse ? '#F8F6F1' : '#17474D'))
const word = computed(() => (props.inverse ? '#F3F1EB' : '#17474D'))
</script>

<style>
.vb-logo { display: inline-flex; align-items: center; flex-shrink: 0; }
.vb-logo__word { font-weight: 700; letter-spacing: -.02em; line-height: 1; }
</style>
