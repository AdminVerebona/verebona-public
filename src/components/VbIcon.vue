<template>
  <svg class="vb-icon" :width="size" :height="size" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <component :is="s.tag" v-for="(s, i) in shapes" :key="i" v-bind="s.attrs" />
  </svg>
</template>

<script setup lang="ts">
/**
 * Icônes linéaires 24 px, trait 1,8, bouts arrondis, style Lucide (charte §5,
 * readme « Iconographie »). SVG en ligne, sans police d'icônes ni CDN.
 * Toujours décoratives (`aria-hidden`) : le sens est porté par le texte voisin.
 */
import { computed } from 'vue'

import { ICONS, type IconName, type Shape } from './icons'


const props = withDefaults(defineProps<{ name: IconName; size?: number }>(), { size: 24 })
const shapes = computed<Shape[]>(() => ICONS[props.name])
</script>
