<template>
  <a class="ha-card" v-bind="bind">
    <div class="ha-card-title">{{ article.h1 }}</div>
    <div class="ha-card-text">{{ article.metaDescription }}</div>
  </a>
</template>

<script setup lang="ts">
/** Fiche d'article : vrai lien `<a href>` explorable (§7, SEO-08). */
import { computed } from 'vue'
import type { RessourceArticle } from '../../ressources/types'
import { useNav } from '../../composables/useNav'
import { trackRessource } from '../../ressources/analytics'

const props = defineProps<{ article: RessourceArticle; fromId?: string }>()
const { link } = useNav()
const bind = computed(() => {
  const l = link(props.article.path)
  return {
    href: l.href,
    onClick: (e: MouseEvent) => {
      if (props.fromId) trackRessource({ name: 'resource_internal_link_click', from_id: props.fromId, to_id: props.article.id })
      l.onClick(e)
    },
  }
})
</script>
