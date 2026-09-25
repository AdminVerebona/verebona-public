<template>
  <nav class="ha-crumbs" aria-label="Fil d’Ariane">
    <ol>
      <template v-for="(c, i) in items" :key="i">
        <li v-if="i > 0" class="ha-sep" aria-hidden="true">›</li>
        <li v-if="c.path && i < items.length - 1"><a v-bind="link(c.path)">{{ c.label }}</a></li>
        <li v-else aria-current="page">{{ c.label }}</li>
      </template>
    </ol>
  </nav>
</template>

<script setup lang="ts">
/** Fil d'Ariane du §11 : « Centre d'aide > {Catégorie} > {Titre de l'article} ». */
import { useNav } from '../../composables/useNav'

defineProps<{ items: Array<{ label: string; path?: string }> }>()
const { link } = useNav()
</script>
