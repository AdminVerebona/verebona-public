<template>
  <div class="rs-cta">
    <RessourceBlocks :blocks="blocks" />
    <template v-if="isPrelaunch">
      <p class="rs-cta-note">{{ labels.pricingTitle }}</p>
      <a class="ha-btn ha-btn-ghost" v-bind="link('/')">Découvrir Verebona</a>
    </template>
    <template v-else>
      <a class="ha-btn" :href="signupUrl()" @click="track">Essayer gratuitement pendant 7 jours</a>
      <p class="rs-cta-note">{{ TRIAL_NOTE }}</p>
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
 *
 * Lot 54 : la note d'essai ne juxtapose plus « Essai Premium » et « 2 biens
 * et 30 documents » (lisible comme des quotas Premium, alors que ce sont
 * ceux de Standard, appliqués à l'essai). Libellé repris de la section
 * tarifs : les limites sont celles de l'ESSAI.
 */
import type { RessourceBlock } from '../../ressources/types'
import { useSiteMode } from '../../config/site'
import { signupUrl } from '../../config/urls'
import { useNav } from '../../composables/useNav'
import { trackRessource } from '../../ressources/analytics'
import RessourceBlocks from './RessourceBlocks.vue'

/** Mêmes phrases que la section tarifs (PricingSection, mode complet). */
const TRIAL_NOTE = 'Commencez par 7 jours d’essai Premium, sans carte bancaire. L’essai est limité à 2 biens et 30 documents. Sans action de votre part, aucun abonnement ne démarre.'

const props = defineProps<{ blocks: RessourceBlock[]; articleId: string }>()
const { isPrelaunch, labels } = useSiteMode()
const { link } = useNav()
const track = () => trackRessource({ name: 'resource_cta_click', article_id: props.articleId, cta_context: 'article_footer' })
</script>
