<template>
<!-- CTA final : aplat pétrole (charte 2026 §6), sans dégradé. -->
<section class="cta vb-on-dark">
  <div class="cta__grid">
    <div class="cta__copy">
      <h2 class="vb-h2 cta__title">Prêt à reprendre le contrôle ?</h2>
      <!-- PRELAUNCH : CTA d'inscription remplacé (CDC pré-lancement §6.6). La phrase
           « Rejoignez les utilisateurs… » est aussi remplacée : elle suppose un
           service déjà ouvert. -->
      <template v-if="isPrelaunch">
        <p class="cta__text">{{ labels.finalCtaText }}</p>
        <span data-testid="prelaunch-final-cta" class="vb-pill vb-pill--on-dark"><span class="vb-pill__dot" aria-hidden="true"></span>{{ labels.finalCta }}</span>
      </template>
      <template v-else>
        <p class="cta__text">Rejoignez les utilisateurs qui ont déjà centralisé leurs biens sur Verebona.</p>
        <!-- Voulu : renvoie vers les tarifs (#pricing), pas vers l'inscription.
             Ne pas remplacer par signupUrl() sans décision produit. -->
        <a href="#pricing" data-testid="final-cta" class="vb-btn vb-btn--inverse vb-btn--lg">Créez votre compte</a>
      </template>
    </div>
    <template v-if="showMascot">
      <img src="/assets/mascot/thumbs-up.webp" alt="" width="190" height="190" class="vb-mascot cta__mascot" />
    </template>
  </div>
</section>
</template>

<script setup lang="ts">
import { useLanding } from '../composables/useLanding'
import { useSiteMode } from '../config/site'
const { showMascot } = useLanding()
const { isPrelaunch, labels } = useSiteMode()
</script>

<style>
.cta { background: var(--vb-petrole); color: var(--vb-blanc); padding: 0 var(--gutter); }
.cta__grid { max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: 1fr auto; gap: 32px; align-items: end; }
.cta__copy { padding: 72px 0; }
.cta__title { color: var(--vb-blanc); margin-bottom: 16px; }
.cta__text { font-size: 17px; line-height: 1.6; color: var(--vb-brume); margin-bottom: 28px; max-width: 520px; }
.cta__mascot { width: 190px; align-self: end; }
@media (max-width: 860px) {
  .cta { padding: 0 20px; }
  .cta__grid { grid-template-columns: 1fr; gap: 0; }
  .cta__copy { padding: 56px 0 8px; }
  .cta__mascot { width: 120px; justify-self: end; }
}
/* Zoom 200 % d'un téléphone (≈195 px, lot 70P). */
@media (max-width: 300px) {
  .cta { padding: 0 14px; }
  .cta__grid { grid-template-columns: minmax(0, 1fr); }
  .cta__mascot { width: 96px; }
}
</style>
