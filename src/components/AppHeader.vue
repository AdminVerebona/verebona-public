<template>
  <!-- Charte 2026 §5 / readme « Layout » : header du site NON fixe, 22 px de
       padding, logo 34 px. -->
  <header id="vb-header" class="hd">
    <div class="hd__bar">
      <a v-bind="link('/')" aria-label="Verebona — accueil" class="hd__logo">
        <VbLogo :size="34" />
      </a>
      <nav class="r-nav hd__nav" aria-label="Navigation principale">
        <a v-bind="anchor('how')">Comment ça marche</a>
        <a v-bind="anchor('cas-usage')">Cas d'usage</a>
        <a v-bind="anchor('pricing')">Tarifs</a>
        <a v-bind="anchor('faq')">FAQ</a>
      </nav>
      <div class="hd__actions">
        <!-- PRELAUNCH : information non cliquable (CDC pré-lancement §6.2) -->
        <span v-if="isPrelaunch" class="r-hide-m vb-pill vb-pill--dashed vb-pill--sm" data-testid="prelaunch-header"
          ><span class="vb-pill__dot" aria-hidden="true"></span>{{ labels.header }}</span
        >
        <template v-else>
          <!--
            Écart assumé au CDC Site Public §6.1 (décision produit 2026-09-28) :
            en mode FULL, le CTA du header reste « Essayer gratuitement » au lieu
            de « Créer un compte » (même destination : inscription). Même libellé
            dans le menu mobile ci-dessous. Verrouillé par tests/prelaunch-cta.test.ts.
          -->
          <a :href="loginUrl()" class="r-hide-m vb-btn vb-btn--secondary vb-btn--sm">Se connecter</a>
          <a :href="signupUrl()" class="r-hide-m vb-btn vb-btn--primary vb-btn--sm">Essayer gratuitement</a>
        </template>
        <button
          type="button"
          class="r-burger hd__burger"
          @click.prevent="toggleMenu"
          :aria-expanded="menuOpen ? 'true' : 'false'"
          aria-controls="vb-mobile-menu"
          aria-label="Menu"
        >
          <VbIcon :name="menuOpen ? 'x' : 'menu'" />
        </button>
      </div>
    </div>
    <template v-if="menuOpen">
      <div id="vb-mobile-menu" class="r-mobile-menu hd__menu">
        <a v-bind="anchor('how')">Comment ça marche</a>
        <a v-bind="anchor('cas-usage')">Cas d'usage</a>
        <a v-bind="anchor('pricing')">Tarifs</a>
        <a v-bind="anchor('faq')">FAQ</a>
        <!-- PRELAUNCH : mêmes règles que le header desktop (CDC §6.3) -->
        <div v-if="isPrelaunch" data-testid="prelaunch-mobile-menu" class="vb-pill vb-pill--dashed hd__menu-pill">
          <span class="vb-pill__dot" aria-hidden="true"></span>{{ labels.header }}
        </div>
        <!-- CTA « Essayer gratuitement » conservé en FULL : écart assumé au CDC
             Site Public §6.1 (« Créer un compte »), décision produit 2026-09-28. -->
        <div v-else class="hd__menu-ctas">
          <a :href="loginUrl()" @click="closeMenu" class="vb-btn vb-btn--secondary">Se connecter</a>
          <a :href="signupUrl()" @click="closeMenu" class="vb-btn vb-btn--primary">Essayer gratuitement</a>
        </div>
      </div>
    </template>
  </header>
</template>

<script setup lang="ts">
import { useNav } from '../composables/useNav'
import { loginUrl, signupUrl } from '../config/urls'
import { useSiteMode } from '../config/site'
import VbLogo from './VbLogo.vue'
import VbIcon from './VbIcon.vue'

const { isPrelaunch, labels } = useSiteMode()
const { menuOpen, toggleMenu, closeMenu, link, anchor } = useNav()
</script>

<style>
.hd { position: relative; z-index: 50; background: var(--bg-page); }
.hd__bar {
  max-width: var(--container); margin: 0 auto; padding: 22px var(--gutter);
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
}
.hd__logo { display: inline-flex; align-items: center; border-radius: var(--radius-sm); }
.hd__nav { display: flex; align-items: center; gap: 32px; font-size: 16px; font-weight: 600; }
.hd__nav a { color: var(--text-primary); border-radius: 6px; transition: color var(--dur) var(--ease); }
.hd__nav a:hover { color: var(--accent); }
.hd__actions { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.hd__burger {
  width: 44px; height: 44px; border-radius: var(--radius-md); border: 1px solid var(--border);
  background: var(--bg-card); color: var(--accent); cursor: pointer; align-items: center; justify-content: center;
}
.hd__menu { flex-direction: column; gap: 2px; padding: 4px 20px 20px; border-top: 1px solid var(--border); background: var(--bg-page); }
.hd__menu > a { padding: 14px 6px; font-size: 16px; font-weight: 600; color: var(--text-primary); border-bottom: 1px solid var(--border-subtle); }
.hd__menu-pill { margin-top: 16px; justify-content: center; }
.hd__menu-ctas { display: flex; gap: 10px; margin-top: 16px; }
.hd__menu-ctas .vb-btn { flex: 1; padding: 0 10px; }
@media (max-width: 860px) {
  .hd__bar { padding: 16px 20px; }
}
/* Zoom 200 % d'un téléphone (≈195 px, lot 70P) : logo et marges réduits pour
   que le logo et le bouton Menu tiennent sur la ligne. */
@media (max-width: 300px) {
  .hd__bar { padding: 12px; gap: 8px; }
  .hd__logo .vb-logo { gap: 7px !important; }
  .hd__logo svg { width: 26px; height: 26px; }
  .hd__logo .vb-logo__word { font-size: 18px !important; }
  .hd__menu { padding-inline: 12px; }
  .hd__menu-ctas { flex-direction: column; }
}
</style>
