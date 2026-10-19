<template>
<!-- Contrôles d'un carrousel natif (lot 69P) : vrais boutons de 44 × 44 px,
     nom accessible explicite, `aria-disabled` aux bornes (le bouton garde le
     focus : pas de perte de focus quand on atteint la fin), position en
     texte réel et annonce polie après un déplacement au bouton. -->
<div class="vb-carousel__controls">
  <button type="button" class="vb-carousel__btn" :aria-label="prevLabel" :aria-controls="controls"
    :aria-disabled="atStart ? 'true' : 'false'" @click="!atStart && $emit('prev')">
    <VbIcon name="chevronLeft" :size="22" />
  </button>
  <p class="vb-carousel__pos" aria-hidden="true">
    <span class="vb-carousel__ticks"><span v-for="i in count" :key="i" :class="['vb-carousel__tick', i - 1 >= first && i - 1 <= last ? 'vb-carousel__tick--on' : '']"></span></span>
    <span class="vb-carousel__count">{{ position }}</span>
  </p>
  <button type="button" class="vb-carousel__btn" :aria-label="nextLabel" :aria-controls="controls"
    :aria-disabled="atEnd ? 'true' : 'false'" @click="!atEnd && $emit('next')">
    <VbIcon name="chevronRight" :size="22" />
  </button>
  <p class="sr-only" aria-live="polite" aria-atomic="true">{{ status }}</p>
</div>
</template>

<script setup lang="ts">
import VbIcon from './VbIcon.vue'

defineProps<{
  controls: string
  prevLabel: string
  nextLabel: string
  atStart: boolean
  atEnd: boolean
  count: number
  first: number
  last: number
  /** Position en clair, ex. « 2 / 6 » ou « 1–3 / 10 ». */
  position: string
  status: string
}>()
defineEmits<{ prev: []; next: [] }>()
</script>
