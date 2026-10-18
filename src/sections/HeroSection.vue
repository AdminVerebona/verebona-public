<template>
<section id="top" class="hero">
  <div class="hero__grid">
    <!-- Colonne texte.
         Ordre imposé (ticket SEO accueil) : H1 → accroche et paragraphe → disponibilité
         → H2 → quatre bénéfices (H3) → signature. Charte 2026 §6 : le bloc de
         bénéfices devient une bande sous le héros (BenefitsSection, rendue juste
         après dans HomeView) ; l'ordre des titres dans le HTML pré-rendu est
         inchangé, le montage de droite ne contient aucun titre. -->
    <div class="hero__copy">
      <h1 class="vb-h1 hero__title"><span class="hero__line">Profitez de vos biens.</span> <span class="hero__line vb-accent">Passez moins de temps à les gérer.</span></h1>
      <p data-testid="hero-lead" class="vb-lead hero__lead">Moins de temps à chercher. Moins de choses à retenir.</p>
      <p data-testid="hero-text" class="vb-text hero__text">Maison, voiture, vélo, équipements… Retrouvez vos documents et les informations de chaque bien au même endroit. Déposez une facture, un contrat ou une garantie : Verebona en extrait les informations utiles et vous aide à suivre vos échéances. Préparez vos démarches avec un historique organisé, de l’achat à la vente ou à la transmission.</p>
      <!-- PRELAUNCH : seule la zone d'action change (CDC pré-lancement §6.4) -->
      <div v-if="isPrelaunch" data-testid="prelaunch-hero" class="hero__action hero__action--row">
        <span class="vb-pill"><span class="vb-pill__dot" aria-hidden="true"></span>{{ labels.heroTitle }}</span>
        <span class="vb-meta hero__note">{{ labels.heroText }}</span>
      </div>
      <div v-else class="hero__action">
        <a :href="signupUrl()" class="vb-btn vb-btn--primary vb-btn--lg">Essayer gratuitement pendant 7 jours <span aria-hidden="true">→</span></a>
        <span class="vb-meta hero__note">Essai Premium sans carte bancaire · 2 biens et 30 documents · aucun abonnement déclenché automatiquement</span>
      </div>
    </div>

    <!-- Montage (charte §6) : 3 photos de biens, carte « Mes documents », carte
         d'échéance, mascotte en bordure basse droite. Deux niveaux de profondeur.
         Illustration : exposée comme une seule image aux technologies d'assistance. -->
    <div class="hero__montage" role="img" aria-label="Aperçu de Verebona : documents classés par bien et prochaine échéance">
      <img class="hero__photo hero__photo--a" src="/assets/appartement-lyon.webp" alt="" width="290" height="200" />
      <img class="hero__photo hero__photo--b" src="/assets/velo-cargo.webp" alt="" width="270" height="170" />
      <img class="hero__photo hero__photo--c" src="/assets/surf-personal.webp" alt="" width="170" height="150" />

      <div class="vb-card vb-card--elevated hero__docs">
        <div class="hero__docs-head"><span class="hero__docs-title">Mes documents</span><span class="hero__docs-all">Voir tous →</span></div>
        <div v-for="d in docs" :key="d.title + d.meta" class="hero__doc">
          <span class="vb-tile vb-tile--sm"><VbIcon name="file" :size="20" /></span>
          <span class="hero__doc-body"><span class="hero__doc-title">{{ d.title }}</span><span class="hero__doc-meta">{{ d.meta }}</span></span>
          <span :class="['vb-badge', d.pending ? 'vb-badge--attention' : '']">{{ d.state }}</span>
        </div>
      </div>

      <div class="vb-card vb-card--elevated hero__due">
        <span class="vb-tile"><VbIcon name="calendar" :size="22" /></span>
        <span class="hero__due-body">
          <span class="hero__doc-title">Entretien annuel chaudière</span>
          <span class="hero__doc-meta">Appartement Lyon · mars 2027</span>
          <span class="vb-badge hero__due-badge">À venir</span>
        </span>
      </div>

      <img v-if="showMascot" class="vb-mascot hero__mascot" src="/assets/mascot/welcome-wave.webp" alt="" width="124" height="124" />
    </div>
  </div>
</section>
</template>

<script setup lang="ts">
import { useLanding } from '../composables/useLanding'
import { signupUrl } from '../config/urls'
import { useSiteMode } from '../config/site'
import VbIcon from '../components/VbIcon.vue'

const { isPrelaunch, labels } = useSiteMode()
const { showMascot } = useLanding()

/** Données d'illustration du montage (mêmes biens que la démo de l'application). */
const docs = [
  { title: 'Facture d’achat', meta: 'Vélo Cargo · 12/03/2024', state: 'Classé', pending: false },
  { title: 'Attestation d’assurance', meta: 'Appartement Lyon · 01/01/2025', state: 'Classé', pending: false },
  { title: 'Facture d’achat', meta: 'Planche de Surf · 05/06/2023', state: 'Analyse…', pending: true },
]
</script>

<style>
.hero { padding: 56px var(--gutter) 80px; }
.hero__grid {
  max-width: var(--container); margin: 0 auto; display: grid;
  grid-template-columns: minmax(0, 1fr) 600px; gap: 56px; align-items: center;
}
.hero__title { margin-bottom: 22px; font-size: clamp(40px, 4.2vw, var(--fs-h1)); }
.hero__line { display: block; }
.hero__lead { max-width: 520px; margin-bottom: 16px; }
.hero__text { max-width: 520px; margin-bottom: 32px; }
.hero__action { display: flex; flex-direction: column; align-items: flex-start; gap: 14px; }
.hero__action--row { flex-direction: row; align-items: center; flex-wrap: wrap; gap: 16px; }
.hero__note { max-width: 480px; }
.hero__action--row .hero__note { max-width: 300px; }

.hero__montage { position: relative; height: 580px; }
.hero__photo { position: absolute; object-fit: cover; border-radius: var(--radius-lg); display: block; }
.hero__photo--a { left: 0; top: 0; width: 290px; height: 200px; }
.hero__photo--b { left: 330px; top: 36px; width: 270px; height: 170px; }
.hero__photo--c { left: 0; top: 408px; width: 170px; height: 150px; }
.hero__docs { position: absolute; left: 56px; top: 150px; width: 400px; padding: 20px 22px; }
.hero__docs-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.hero__docs-title { font-size: 19px; font-weight: 700; color: var(--text-heading); }
.hero__docs-all { font-size: 14px; font-weight: 600; color: var(--accent); }
.hero__doc { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-top: 1px solid var(--accent-soft); }
.hero__doc-body, .hero__due-body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.hero__doc-title { font-size: 16px; font-weight: 700; color: var(--text-primary); }
.hero__doc-meta { font-size: 13.5px; color: var(--text-muted); }
.hero__due { position: absolute; left: 300px; top: 430px; width: 290px; padding: 16px 18px; display: flex; gap: 14px; align-items: center; }
.hero__due .hero__doc-title { font-size: 15px; }
.hero__due-badge { align-self: flex-start; margin-top: 6px; }
.hero__mascot { position: absolute; right: -16px; bottom: -8px; width: 124px; }

@media (max-width: 1180px) {
  .hero__grid { grid-template-columns: 1fr; gap: 48px; }
  .hero__montage { width: 600px; max-width: 100%; margin: 0 auto; }
}
@media (max-width: 860px) {
  .hero { padding: 24px 20px 56px; }
  .hero__title { font-size: var(--fs-h1-mobile); }
  .hero__action--row { flex-direction: column; align-items: stretch; }
  .hero__action .vb-btn { width: 100%; white-space: normal; }
  .hero__action .vb-pill { justify-content: center; }
  /* Mobile : cartes empilées, sans photos (maquette « 1c Mobile 390 »). */
  .hero__montage { height: auto; width: auto; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 16px; align-items: end; }
  .hero__photo { display: none; }
  .hero__docs, .hero__due { position: static; width: auto; }
  .hero__docs { grid-column: 1 / -1; padding: 18px; }
  .hero__mascot { position: static; width: 96px; }
}
</style>
