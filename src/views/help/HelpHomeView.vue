<template>
<div :class="{ 'ha-embedded': embedded }">
  <section class="ha-hero">
    <div class="ha-hero-inner">
      <HelpCrumbs v-if="query" :items="[{ label: 'Centre d’aide', path: '/aide' }, { label: 'Recherche' }]" />
      <div class="ha-eyebrow">Centre d’aide</div>
      <h1 class="ha-title">{{ query ? `Résultats pour « ${query} »` : 'Comment pouvons-nous vous aider ?' }}</h1>
      <p v-if="!query" class="ha-lead">Retrouvez les réponses pour utiliser Verebona, gérer vos biens, vos documents, vos échéances et votre compte.</p>
      <HelpSearchBox :initial="query" />
    </div>
  </section>

  <section class="ha-body">
    <div class="ha-body-inner">
      <!-- Résultats de recherche (§4, SEARCH-05, SEARCH-06) -->
      <div v-if="query" class="ha-section" aria-live="polite">
        <p class="ha-muted" style="margin:0 0 14px">{{ results.length }} résultat(s)</p>
        <div v-if="results.length" class="ha-list">
          <HelpArticleCard v-for="r in results" :key="r.doc.id" :article="help.articleById(r.doc.id)!"
                           :text="r.excerpt" :category-name="r.doc.categoryName" :terms="r.terms" />
        </div>
        <div v-else class="ha-panel">
          <p style="margin:0;font-size:16px;line-height:1.6;color:#334155">
            Aucun article ne correspond suffisamment à votre recherche. Essayez avec moins de mots, un autre terme ou parcourez les catégories ci-dessous.
          </p>
        </div>
      </div>

      <div v-if="!query" class="ha-section">
        <h2 class="ha-h2">Aide fréquente</h2>
        <div class="ha-grid">
          <HelpArticleCard v-for="a in help.frequent" :key="a.id" :article="a" />
        </div>
      </div>

      <div class="ha-section">
        <h2 class="ha-h2">Parcourir par thème</h2>
        <div class="ha-grid">
          <a v-for="c in help.categories" :key="c.slug" class="ha-card" v-bind="link(help.categoryPath(c))">
            <div class="ha-card-title">{{ c.name }}</div>
            <div class="ha-card-text">{{ c.intro }}</div>
            <div class="ha-card-foot">{{ help.articlesOf(c.slug).length }} article(s)</div>
          </a>
        </div>
      </div>

      <div class="ha-section"><HelpContactBlock /></div>
    </div>
  </section>
</div>
</template>

<script setup lang="ts">
/**
 * Accueil du Centre d'aide et résultats de recherche — §4, §11.
 *
 * Une seule page pour les deux : la recherche garde sous la main les thèmes
 * et le contact, que le §4 demande de proposer quand rien ne correspond.
 */
import '../../help/help.css'
import { computed, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHelpCenter } from '../../help/useHelpCenter'
import { search } from '../../help/search'
import { helpHomeHead, helpSearchHead } from '../../help/head'
import { clearHelpHead, useHelpHead } from '../../help/useHelpHead'
import { useEmbed } from '../../help/embed'
import { useNav } from '../../composables/useNav'
import HelpCrumbs from '../../components/help/HelpCrumbs.vue'
import HelpSearchBox from '../../components/help/HelpSearchBox.vue'
import HelpArticleCard from '../../components/help/HelpArticleCard.vue'
import HelpContactBlock from '../../components/help/HelpContactBlock.vue'

const route = useRoute()
const help = useHelpCenter()
const { link } = useNav()
const { embedded } = useEmbed()

const query = computed(() => (typeof route.query.q === 'string' ? route.query.q.trim().slice(0, 200) : ''))
const results = computed(() => (query.value ? search(help.searchIndex(), query.value) : []))

useHelpHead(() => (query.value ? helpSearchHead(query.value) : helpHomeHead()))
onUnmounted(clearHelpHead)
</script>
