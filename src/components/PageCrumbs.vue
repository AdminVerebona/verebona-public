<template>
  <nav aria-label="Fil d'Ariane" class="vb-crumbs">
    <ol>
      <li><a v-bind="link('/')"><VbIcon name="home" :size="15" />Accueil</a></li>
      <li aria-hidden="true" class="vb-crumbs__sep"><VbIcon name="chevronRight" :size="15" /></li>
      <li aria-current="page">{{ current }}</li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
/** Fil d'Ariane « Accueil › page » des pages contact et légales. */
import { useNav } from '../composables/useNav'
import VbIcon from './VbIcon.vue'

defineProps<{ current: string }>()
const { link } = useNav()
</script>
