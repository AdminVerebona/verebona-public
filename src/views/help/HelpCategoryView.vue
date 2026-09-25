<template>
<div :class="{ 'ha-embedded': embedded }">
  <section class="ha-hero">
    <div class="ha-hero-inner">
      <HelpCrumbs :items="[{ label: 'Centre d’aide', path: '/aide' }, { label: category?.name ?? 'Thème introuvable' }]" />
      <template v-if="category">
        <div class="ha-eyebrow">Centre d’aide</div>
        <h1 class="ha-title">{{ category.name }}</h1>
        <p class="ha-lead">{{ category.intro }}</p>
      </template>
      <template v-else>
        <h1 class="ha-title">Ce thème n’existe pas</h1>
        <p class="ha-lead">Recherchez un article ou revenez au Centre d’aide.</p>
      </template>
      <HelpSearchBox />
    </div>
  </section>

  <section class="ha-body">
    <div class="ha-body-inner">
      <div v-if="category" class="ha-section">
        <div class="ha-list">
          <HelpArticleCard v-for="a in list" :key="a.id" :article="a" />
        </div>
      </div>
      <div v-else class="ha-section">
        <a class="ha-btn" v-bind="link('/aide')">Revenir au Centre d’aide</a>
      </div>
      <div class="ha-section"><HelpContactBlock /></div>
    </div>
  </section>
</div>
</template>

<script setup lang="ts">
/** Page d'un thème : son introduction (§11.1) et ses articles, dans l'ordre du corpus. */
import '../../help/help.css'
import { computed, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHelpCenter } from '../../help/useHelpCenter'
import { helpCategoryHead, helpNotFoundHead } from '../../help/head'
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

const category = computed(() => {
  const c = help.category(String(route.params.category ?? ''))
  // Un thème sans article publié ici n'est pas proposé.
  return c && help.articlesOf(c.slug).length ? c : null
})
const list = computed(() => (category.value ? help.articlesOf(category.value.slug) : []))

useHelpHead(() => (category.value ? helpCategoryHead(category.value) : helpNotFoundHead()))
onUnmounted(clearHelpHead)
</script>
