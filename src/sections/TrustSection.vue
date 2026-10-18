<template>
<section class="vb-section trust">
  <div class="vb-container">
    <div class="trust__intro">
      <template v-if="showMascot">
        <img src="/assets/mascot/security-shield.webp" alt="" width="120" height="120" class="vb-mascot trust__mascot" />
      </template>
      <div class="trust__copy">
        <span class="vb-eyebrow">Sécurité des données</span>
        <h2 class="vb-h2">Vos données sont protégées, hébergées en France et sauvegardées chaque jour.</h2>
        <p class="vb-text trust__text">Verebona protège l'accès à vos informations et ne revend pas vos données. Vous restez propriétaire des contenus déposés et pouvez les récupérer ou les supprimer.</p>
      </div>
    </div>
    <!-- Pictogrammes de confiance redessinés en trait pétrole sur brume, détail
         cuivre (maquette « Accueil 2026 », charte §5) : remplacent les PNG
         prévus pour fond sombre. Décoratifs : le titre de la carte porte le sens. -->
    <div class="trust__grid r-stack">
      <div class="vb-card trust__card">
        <span class="vb-tile vb-tile--lg trust__tile">
          <svg width="80" height="72" viewBox="-2 -2 116 104" fill="none" stroke="#17474D" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M75.06,19.84L78.25,22.57L87.99,24.48L84.58,31.49L83.73,38.69L81.85,40.40L78.78,39.49L79.00,42.03L74.06,47.61L73.94,52.05L77.18,50.52L79.49,54.81L79.22,57.56L81.22,61.19L78.86,64.11L80.61,71.47L84.29,72.67L83.51,76.74L77.37,82.01L64.02,79.49L54.17,82.51L53.39,88.05L45.55,89.24L37.92,85.09L35.46,87.07L23.01,82.88L20.31,79.27L23.81,73.66L25.11,54.58L18.11,44.25L13.12,39.20L2.79,35.33L2.10,27.91L10.88,25.66L22.23,28.31L20.09,16.57L26.49,21.06L42.23,12.89L44.28,4.16L50.20,2L51.18,5.76L54.32,5.94L57.46,10.22L62.19,15.21L65.68,14.39L71.60,19.16L73.11,20.07ZM92.38,86.63L96.74,83.10L97.89,90.99L95.65,98L92.58,96.16L91.02,90.03Z" fill="#F8F6F1"/><rect x="39" y="38" width="22" height="8" rx="2"/><rect x="39" y="49" width="22" height="8" rx="2"/><path d="M43 42h.01M43 53h.01M47 42h8M47 53h8M50 57v6M45 63h10"/><rect x="94" y="4" width="6" height="14" rx="1" fill="#17474D" stroke="none"/><rect x="100" y="4" width="6" height="14" fill="#F8F6F1" stroke="#17474D" stroke-width="1.4"/><rect x="106" y="4" width="6" height="14" rx="1" fill="#D66B53" stroke="none"/><path d="M94 4v24" stroke-width="2"/></svg>
        </span>
        <h3 class="vb-h3 trust__h3">Hébergement en France</h3>
        <p class="trust__p">Vos données sont stockées exclusivement sur des serveurs sécurisés en France, sous la protection des réglementations européennes les plus rigoureuses.</p>
      </div>
      <div class="vb-card trust__card">
        <span class="vb-tile vb-tile--lg trust__tile">
          <svg width="72" height="72" viewBox="0 0 100 100" fill="none" stroke="#17474D" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M50 8 18 20v24c0 20 13.5 35.5 32 42 18.5-6.5 32-22 32-42V20z" fill="#F8F6F1"/><path d="M50 16 26 25v19c0 15.5 10.2 27.6 24 33.2C63.8 71.6 74 59.5 74 44V25z" stroke-width="1.6" stroke-dasharray="3 3"/><rect x="38" y="44" width="24" height="20" rx="4" fill="#17474D" stroke="none"/><path d="M42 44v-6a8 8 0 0 1 16 0v6"/><circle cx="50" cy="52" r="2.6" fill="#D66B53" stroke="none"/><path d="M50 54.5V59" stroke="#D66B53" stroke-width="2.2"/><text x="26" y="36" font-family="Figtree, sans-serif" font-size="9" font-weight="800" fill="#AA4E38" stroke="none">SSL</text><text x="60" y="78" font-family="Figtree, sans-serif" font-size="9" font-weight="800" fill="#AA4E38" stroke="none">2FA</text></svg>
        </span>
        <h3 class="vb-h3 trust__h3">Connexion sécurisée</h3>
        <p class="trust__p">Verebona utilise une connexion chiffrée pour protéger les échanges avec l'application et une authentification à deux facteurs (2FA) pour une sécurité renforcée.</p>
      </div>
      <div class="vb-card trust__card">
        <span class="vb-tile vb-tile--lg trust__tile">
          <svg width="72" height="72" viewBox="0 0 100 100" fill="none" stroke="#17474D" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M28 72a15 15 0 0 1-2.3-29.8A21 21 0 0 1 66 40a13.5 13.5 0 0 1 4 26.4" fill="#F8F6F1"/><path d="M28 72h40"/><rect x="38" y="56" width="24" height="20" rx="4" fill="#17474D" stroke="none"/><path d="M42 56v-6a8 8 0 0 1 16 0v6"/><circle cx="50" cy="64" r="2.6" fill="#D66B53" stroke="none"/><path d="M50 66.5V71" stroke="#D66B53" stroke-width="2.2"/><path d="M86 30a11 11 0 1 1-4.5-8.8" stroke="#D66B53"/><path d="M86 18v12h-12" stroke="#D66B53"/></svg>
        </span>
        <h3 class="vb-h3 trust__h3">Sauvegarde protégée</h3>
        <p class="trust__p">Des sauvegardes automatiques et chiffrées sont effectuées quotidiennement sur des serveurs redondants, garantissant la pérennité de vos informations.</p>
      </div>
    </div>
  </div>
</section>
</template>

<script setup lang="ts">
import { useLanding } from '../composables/useLanding'
const { showMascot } = useLanding()
</script>

<style>
.trust__intro { display: flex; align-items: center; gap: 32px; margin-bottom: 44px; }
.trust__mascot { width: 120px; }
.trust__copy { flex: 1; min-width: 0; max-width: 780px; }
.trust__text { margin-top: 14px; max-width: 700px; }
.trust__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.trust__card { padding: 28px; }
.trust__tile { margin-bottom: 18px; }
.trust__h3 { margin-bottom: 8px; }
.trust__p { font-size: 15.5px; line-height: 1.6; color: var(--text-muted); }
@media (max-width: 860px) {
  .trust__intro { flex-direction: column; align-items: flex-start; gap: 16px; }
  .trust__mascot { width: 96px; }
  .trust__card { padding: 22px; }
}
</style>
