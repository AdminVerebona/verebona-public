<template>
<section style="background:linear-gradient(135deg,#1D4ED8,#2563EB 55%,#0B3AA8);color:#fff;padding:16px 24px 0">
  <div class="r-cta" style="max-width:1000px;margin:0 auto;display:grid;grid-template-columns:1fr auto;gap:24px;align-items:end">
    <div class="vb-reveal" style="padding:40px 0 56px">
      <h2 style="font-size:44px;font-weight:600;letter-spacing:-.02em;margin-bottom:14px;line-height:1.1">Prêt à reprendre le contrôle ?</h2>
      <!-- PRELAUNCH : CTA d'inscription remplacé (CDC pré-lancement §6.6). La phrase
           « Rejoignez les utilisateurs… » est aussi remplacée : elle suppose un
           service déjà ouvert. -->
      <template v-if="isPrelaunch">
        <p style="font-size:16px;color:rgba(255,255,255,.82);margin-bottom:26px;max-width:520px">{{ labels.finalCtaText }}</p>
        <span data-testid="prelaunch-final-cta" style="display:inline-flex;align-items:center;gap:10px;font-size:16px;font-weight:600;color:#fff;padding:13px 26px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.4);cursor:default;user-select:none"><span aria-hidden="true" style="width:8px;height:8px;border-radius:50%;background:#7CF0D6"></span>{{ labels.finalCta }}</span>
      </template>
      <template v-else>
        <p style="font-size:16px;color:rgba(255,255,255,.82);margin-bottom:26px;max-width:520px">Rejoignez les utilisateurs qui ont déjà centralisé leurs biens sur Verebona.</p>
        <!-- Voulu : renvoie vers les tarifs (#pricing), pas vers l'inscription.
             Ne pas remplacer par signupUrl() sans décision produit. -->
        <a href="#pricing" data-testid="final-cta" style="display:inline-block;font-size:16px;font-weight:600;color:#1D4ED8;background:#fff;padding:14px 28px;border-radius:999px;box-shadow:0 16px 34px rgba(4,10,26,.3)">Créez votre compte</a>
      </template>
    </div>
    <template v-if="showMascot">
    <img src="/assets/mascot/thumbs-up.webp" alt="Verebona" style="width:210px;height:auto;filter:drop-shadow(0 24px 40px rgba(4,10,26,.4));align-self:end"/>
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
