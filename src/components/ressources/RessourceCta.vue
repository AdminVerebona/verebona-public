<template>
  <div class="rs-cta">
    <RessourceBlocks :blocks="blocks" />
    <template v-if="isPrelaunch">
      <p class="rs-cta-note">{{ labels.pricingTitle }}</p>
      <a class="ha-btn ha-btn-ghost" v-bind="link('/')">Découvrir Verebona</a>
    </template>
    <template v-else>
      <a class="ha-btn" :href="signupUrl()" @click="track">Essayer gratuitement pendant 7 jours</a>
      <p class="rs-cta-note">Essai Premium sans carte bancaire · 2 biens et 30 documents · aucun abonnement déclenché automatiquement.</p>
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * Transition vers Verebona — CDC Ressources V6 §14, CONV-01, CONV-02, CONV-06, UX-04.
 *
 * Une seule par page, APRÈS la réponse. Cible : le parcours d'essai réel de
 * l'application (7 jours, sans carte bancaire), avec le code de parrainage
 * éventuel — jamais un formulaire fictif ni une offre nouvelle. Libellés
 * identiques à ceux de l'accueil.
 *
 * Pré-lancement : aucun lien d'inscription (CDC pré-lancement §7) — l'essai
 * est annoncé au futur, le lien mène à l'accueil.
 */
import type { RessourceBlock } from '../../ressources/types'
import { useSiteMode } from '../../config/site'
import { signupUrl } from '../../config/urls'
import { useNav } from '../../composables/useNav'
import { trackRessource } from '../../ressources/analytics'
import RessourceBlocks from './RessourceBlocks.vue'

const props = defineProps<{ blocks: RessourceBlock[]; articleId: string }>()
const { isPrelaunch, labels } = useSiteMode()
const { link } = useNav()
const track = () => trackRessource({ name: 'resource_cta_click', article_id: props.articleId, cta_context: 'article_footer' })
</script>
