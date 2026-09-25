<template>
  <a class="ha-card" v-bind="link(article.canonical)">
    <div class="ha-card-title"><template v-for="(s, i) in titleParts" :key="i"><mark v-if="s.mark" class="ha-mark">{{ s.text }}</mark><template v-else>{{ s.text }}</template></template></div>
    <div class="ha-card-text">
      <template v-for="(s, i) in textParts" :key="i"><mark v-if="s.mark" class="ha-mark">{{ s.text }}</mark><template v-else>{{ s.text }}</template></template>
    </div>
    <div v-if="categoryName || restricted" class="ha-card-foot">
      <span v-if="categoryName">{{ categoryName }}</span>
      <span v-if="restricted" class="ha-badge">{{ offersLabel }}</span>
    </div>
  </a>
</template>

<script setup lang="ts">
/**
 * Carte d'article : titre, extrait et, si utile, catégorie et offre
 * (SEARCH-05 : « titre, catégorie, extrait pertinent et information d'offre »).
 */
import { computed } from 'vue'
import type { HelpArticle } from '../../help/types'
import { highlight } from '../../help/search'
import { offersLabel as label } from '../../help/outputs'
import { useNav } from '../../composables/useNav'

const props = defineProps<{ article: HelpArticle; text?: string; categoryName?: string; terms?: string[] }>()
const { link } = useNav()
const restricted = computed(() => props.article.offers.length < 3)
const offersLabel = computed(() => label(props.article.offers))
const titleParts = computed(() => highlight(props.article.title, props.terms ?? []))
const textParts = computed(() => highlight(props.text ?? props.article.summary, props.terms ?? []))
</script>
