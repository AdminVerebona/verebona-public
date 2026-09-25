<template>
<div :class="{ 'ha-embedded': embedded }">
  <section class="ha-hero">
    <div class="ha-hero-inner ha-narrow" style="max-width:860px">
      <HelpCrumbs :items="crumbs" />

      <template v-if="article">
        <div class="ha-eyebrow">{{ category?.name }}</div>
        <h1 class="ha-title">{{ article.title }}</h1>
        <p class="ha-lead">{{ article.summary }}</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px">
          <span v-if="help.isRestricted(article)" class="ha-badge">{{ help.offersLabel(article.offers) }}</span>
        </div>
        <p v-if="article.offersNote" class="ha-meta">{{ article.offersNote }}</p>
        <p v-if="updated" class="ha-meta">Mis à jour le {{ updated }}</p>
      </template>

      <template v-else>
        <h1 class="ha-title">Cet article n’est plus disponible</h1>
        <p class="ha-lead">Il a peut-être été déplacé ou remplacé. Recherchez un autre article ou revenez au Centre d’aide.</p>
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:22px">
          <a class="ha-btn" v-bind="link('/aide')">Revenir au Centre d’aide</a>
          <a class="ha-btn ha-btn-ghost" href="#ha-search-zone" @click.prevent="focusSearch">Rechercher</a>
        </div>
        <div id="ha-search-zone"><HelpSearchBox /></div>
      </template>
    </div>
  </section>

  <section class="ha-body">
    <div class="ha-narrow">
      <template v-if="article">
        <!-- Préproduction : article relu avant la levée de son blocage (§14). -->
        <div v-if="article.status === 'blocked'" class="ha-callout ha-callout-warning" role="note">
          <strong>Publication conditionnée — visible en préproduction uniquement</strong>
          {{ article.blocker }}
        </div>

        <HelpBlocks :blocks="article.blocks" />

        <div v-if="related.length" class="ha-section">
          <h2 class="ha-h2">Articles liés</h2>
          <div class="ha-list">
            <HelpArticleCard v-for="a in related" :key="a.id" :article="a" />
          </div>
        </div>

        <div class="ha-section"><HelpFeedback :article-id="article.id" :version="help.version" /></div>
      </template>

      <div class="ha-section"><HelpContactBlock /></div>
    </div>
  </section>
</div>
</template>

<script setup lang="ts">
/**
 * Article du Centre d'aide — §3, §11, SEO-01, REDIR-01, REDIR-02.
 *
 * Une ancienne adresse reçoit une redirection permanente du serveur ; celle-ci
 * couvre en plus la navigation interne (lien cliqué dans une page déjà
 * chargée). Une adresse inconnue affiche l'état « introuvable » du §11, jamais
 * une page vide.
 */
import '../../help/help.css'
import { computed, onUnmounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHelpCenter } from '../../help/useHelpCenter'
import { helpArticleHead, helpNotFoundHead } from '../../help/head'
import { clearHelpHead, useHelpHead } from '../../help/useHelpHead'
import { useEmbed } from '../../help/embed'
import { useNav } from '../../composables/useNav'
import HelpCrumbs from '../../components/help/HelpCrumbs.vue'
import HelpBlocks from '../../components/help/HelpBlocks.vue'
import HelpArticleCard from '../../components/help/HelpArticleCard.vue'
import HelpFeedback from '../../components/help/HelpFeedback.vue'
import HelpContactBlock from '../../components/help/HelpContactBlock.vue'
import HelpSearchBox from '../../components/help/HelpSearchBox.vue'

const route = useRoute()
const router = useRouter()
const help = useHelpCenter()
const { link } = useNav()
const { embedded } = useEmbed()

const slug = computed(() => String(route.params.slug ?? ''))
const article = computed(() => help.article(slug.value))
const category = computed(() => (article.value ? help.category(article.value.category) : null))
const related = computed(() => (article.value ? help.related(article.value) : []))

const updated = computed(() => {
  const d = article.value?.updatedAt
  return d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null
})

const crumbs = computed(() => article.value && category.value
  ? [
      { label: 'Centre d’aide', path: '/aide' },
      { label: category.value.name, path: help.categoryPath(category.value) },
      { label: article.value.title },
    ]
  : [{ label: 'Centre d’aide', path: '/aide' }, { label: 'Article introuvable' }])

watchEffect(() => {
  if (article.value || typeof window === 'undefined') return
  const target = help.redirectFor(`/aide/${slug.value}`)
  if (target) router.replace({ path: target, query: route.query, hash: route.hash })
})

function focusSearch() {
  document.querySelector<HTMLInputElement>('#ha-search-zone input')?.focus()
}

useHelpHead(() => (article.value ? helpArticleHead(article.value, category.value ?? undefined) : helpNotFoundHead()))
onUnmounted(clearHelpHead)
</script>
