<template>
<div>
  <section class="ha-hero">
    <div class="ha-hero-inner" style="max-width:860px">
      <HelpCrumbs :items="crumbs" />
      <template v-if="article">
        <div class="ha-eyebrow">{{ category?.name }}</div>
        <h1 class="ha-title">{{ article.h1 }}</h1>
        <p class="rs-meta">
          <span v-if="reviewed">Sources vérifiées le {{ reviewed }}</span>
          <span v-if="updated">Mis à jour le {{ updated }}</span>
          <span>Par {{ article.reviewOwner }}</span>
        </p>
      </template>
      <template v-else>
        <h1 class="ha-title">{{ gone ? 'Cette ressource a été retirée' : 'Cette ressource n’existe pas' }}</h1>
        <p class="ha-lead">{{ gone ? 'Elle n’est plus publiée. Les autres guides restent disponibles.' : 'L’adresse est peut-être incorrecte. Retrouvez tous les guides depuis l’index.' }}</p>
        <div style="margin-top:22px"><a class="ha-btn" v-bind="link('/ressources')">Voir toutes les ressources</a></div>
      </template>
    </div>
  </section>

  <section v-if="article" class="ha-body">
    <div class="ha-narrow">
      <div v-if="article.status !== 'published'" class="ha-callout ha-callout-warning rs-preview" role="note">
        <strong>Prévisualisation — {{ statusLabel }}</strong>
        Version visible en préproduction uniquement, non indexée.
      </div>

      <div class="ha-article">
        <RessourceBlocks :blocks="article.intro" />

        <nav v-if="article.sections.length >= 4" class="rs-toc" aria-labelledby="rs-toc-title">
          <p id="rs-toc-title" class="rs-toc-title">Sommaire</p>
          <ul>
            <li v-for="s in article.sections" :key="s.anchor"><a :href="`#${s.anchor}`">{{ s.heading }}</a></li>
          </ul>
        </nav>

        <template v-for="s in article.sections" :key="s.anchor">
          <h2 :id="s.anchor">{{ s.heading }}</h2>
          <RessourceBlocks :blocks="s.blocks" />
        </template>

        <h2 id="checklist">Checklist pratique</h2>
        <ul class="rs-check">
          <li v-for="(it, i) in article.checklist" :key="i"><HelpInlines :inlines="it" /></li>
        </ul>

        <h2 id="exemple">Exemple concret</h2>
        <div class="rs-example">
          <div class="rs-example-label">Exemple illustratif</div>
          <RessourceBlocks :blocks="article.example" />
        </div>

        <template v-if="article.faq.length">
          <h2 id="questions">Questions fréquentes</h2>
          <template v-for="(f, i) in article.faq" :key="i">
            <h3>{{ f.question }}</h3>
            <RessourceBlocks :blocks="f.answer" />
          </template>
        </template>

        <h2 id="verebona">Et avec Verebona ?</h2>
        <RessourceCta :blocks="article.cta" :article-id="article.id" />

        <h2 id="sources">Sources officielles</h2>
        <ul class="rs-sources">
          <li v-for="s in article.sources" :key="s.url">
            <a :href="s.url" target="_blank" rel="noopener noreferrer">{{ s.title }}<span class="sr-only"> (nouvel onglet)</span></a>
            <span class="rs-source-domain">{{ s.domain }}</span>
          </li>
        </ul>
        <p v-if="reviewed" class="rs-reviewed">Contrôle éditorial des sources : {{ reviewed }}. Les règles et délais peuvent évoluer : vérifiez la source officielle avant toute démarche.</p>
      </div>

      <div v-if="related.length" class="ha-section">
        <h2 class="ha-h2">À lire aussi</h2>
        <div class="ha-list">
          <RessourceCard v-for="r in related" :key="r.id" :article="r" :from-id="article.id" />
        </div>
      </div>

      <a class="rs-back" v-bind="link('/ressources')">← Retourner aux ressources</a>
    </div>
  </section>
</div>
</template>

<script setup lang="ts">
/**
 * Article Ressources — CDC Ressources V6 NAV-04, NAV-05, UX-02, UX-03, UX-05,
 * CONV-01, NFR-05.
 *
 * Fil d'Ariane, H1 unique, date de revue et éditeur réel, réponse immédiate,
 * sommaire ancré (≥ 4 sections), sections H2, checklist, exemple illustratif,
 * FAQ, UNE transition Verebona après la réponse, sources avec domaine, liens
 * vers 2 ou 3 articles et retour à l'index. Une ancienne adresse reçoit une
 * 301 du serveur ; la navigation interne suit la même table. Une adresse
 * inconnue ou retirée affiche un état explicite (404 / 410 côté serveur).
 */
import '../../help/help.css'
import '../../ressources/ressources.css'
import { computed, onUnmounted, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRessources } from '../../ressources/useRessources'
import { ressourceArticleHead, ressourceNotFoundHead } from '../../ressources/head'
import { STATUS_LABELS } from '../../ressources/types'
import { trackRessource } from '../../ressources/analytics'
import { clearHelpHead, useHelpHead } from '../../help/useHelpHead'
import { useNav } from '../../composables/useNav'
import HelpCrumbs from '../../components/help/HelpCrumbs.vue'
import HelpInlines from '../../components/help/HelpInlines.vue'
import RessourceBlocks from '../../components/ressources/RessourceBlocks.vue'
import RessourceCard from '../../components/ressources/RessourceCard.vue'
import RessourceCta from '../../components/ressources/RessourceCta.vue'

const route = useRoute()
const router = useRouter()
const rs = useRessources()
const { link } = useNav()

const slug = computed(() => String(route.params.slug ?? ''))
const path = computed(() => `/ressources/${slug.value}`)
const article = computed(() => rs.article(slug.value))
const category = computed(() => (article.value ? rs.category(article.value.category) : null))
const related = computed(() => (article.value ? rs.related(article.value) : []))
const gone = computed(() => !article.value && rs.isGone(path.value))
const statusLabel = computed(() => (article.value ? STATUS_LABELS[article.value.status] : ''))

const fr = (d: string | null | undefined) =>
  d ? new Date(`${d}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }) : null
const reviewed = computed(() => fr(article.value?.reviewedAt))
const updated = computed(() => fr(article.value?.updatedAt))

const crumbs = computed(() => [
  { label: 'Accueil', path: '/' },
  { label: 'Ressources', path: '/ressources' },
  { label: article.value ? article.value.h1 : gone.value ? 'Ressource retirée' : 'Ressource introuvable' },
])

watchEffect(() => {
  if (article.value || typeof window === 'undefined') return
  const target = rs.redirectFor(path.value)
  if (target) router.replace({ path: target, query: route.query, hash: route.hash })
})

watch(article, (a) => {
  if (a && typeof window !== 'undefined') trackRessource({ name: 'resource_view', article_id: a.id, category: a.category, slug: a.slug })
}, { immediate: true })

useHelpHead(() => (article.value ? ressourceArticleHead(article.value, category.value ?? undefined) : ressourceNotFoundHead(gone.value)))
onUnmounted(clearHelpHead)
</script>
