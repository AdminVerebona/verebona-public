<template>
<div>
  <section class="ha-hero">
    <div class="ha-hero-inner">
      <HelpCrumbs :items="[{ label: 'Accueil', path: '/' }, { label: 'Ressources' }]" />
      <div class="ha-eyebrow">Ressources</div>
      <h1 class="ha-title">{{ H1 }}</h1>
      <p class="ha-lead">{{ PROMISE }} Des guides pratiques pour retrouver une facture, vérifier une garantie, suivre les échéances d’une voiture ou d’un logement et préparer un dossier d’assurance.</p>
      <nav aria-label="Catégories de ressources">
        <ul class="rs-chips">
          <li v-for="c in rs.categories" :key="c.slug"><a :href="`#${c.slug}`">{{ c.name }}</a></li>
        </ul>
      </nav>
    </div>
  </section>

  <section class="ha-body">
    <div class="ha-body-inner">
      <div v-for="c in rs.categories" :id="c.slug" :key="c.slug" class="ha-section rs-cat">
        <h2 class="ha-h2">{{ c.name }}</h2>
        <p class="rs-cat-intro">{{ c.intro }}</p>
        <div class="ha-grid">
          <RessourceCard v-for="a in rs.articlesOf(c.slug)" :key="a.id" :article="a" />
        </div>
      </div>
      <p v-if="!rs.count" class="ha-panel">Aucune ressource n’est publiée pour le moment.</p>
      <div class="ha-section">
        <div class="ha-panel ha-contact">
          <div>
            <div class="ha-contact-title">Vous utilisez déjà Verebona ?</div>
            <div class="ha-contact-text">Les explications sur le produit se trouvent dans le Centre d’aide.</div>
          </div>
          <a class="ha-btn ha-btn-ghost" v-bind="link('/aide')">Centre d’aide</a>
        </div>
      </div>
    </div>
  </section>
</div>
</template>

<script setup lang="ts">
/**
 * Index /ressources — CDC Ressources V6 §8, NAV-02, NAV-07, UX-01.
 *
 * Titre, phrase de valeur, catégories (ancres de la page, jamais des pages de
 * catégorie ni des facettes indexables) et fiches des seuls articles visibles.
 */
import '../../help/help.css'
import '../../ressources/ressources.css'
import { onUnmounted } from 'vue'
import { useRessources } from '../../ressources/useRessources'
import { RESSOURCES_H1 as H1, RESSOURCES_PROMISE as PROMISE, ressourcesIndexHead } from '../../ressources/head'
import { clearHelpHead, useHelpHead } from '../../help/useHelpHead'
import { useNav } from '../../composables/useNav'
import HelpCrumbs from '../../components/help/HelpCrumbs.vue'
import RessourceCard from '../../components/ressources/RessourceCard.vue'

const rs = useRessources()
const { link } = useNav()
useHelpHead(() => ressourcesIndexHead())
onUnmounted(clearHelpHead)
</script>
