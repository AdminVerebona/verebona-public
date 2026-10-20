<template>
<footer class="ft">
  <div class="ft__grid">
    <div>
      <VbLogo :size="34" />
      <p class="ft__copy">© 2026 Verebona. Tous droits réservés.</p>
    </div>
    <div>
      <div class="ft__title">Produit</div>
      <div class="ft__links">
        <a v-bind="anchor('how')">Comment ça marche</a>
        <a v-bind="anchor('cas-usage')">Cas d'usage</a>
        <a v-bind="anchor('pricing')">Tarifs</a>
      </div>
    </div>
    <div>
      <div class="ft__title">Support</div>
      <div class="ft__links">
        <a v-bind="anchor('faq')">FAQ</a>
        <a v-bind="link('/aide')">Centre d'aide</a>
        <a v-bind="link('/ressources')">Ressources</a>
        <a v-bind="link('/contact')">Contact</a>
      </div>
    </div>
    <div>
      <div class="ft__title">Légal</div>
      <div class="ft__links">
        <a v-bind="link('/mentions-legales')">Mentions légales</a>
        <a v-bind="link('/cgu')">CGSU</a>
        <a v-bind="link('/confidentialite')">Confidentialité</a>
      </div>
    </div>
  </div>
</footer>
</template>

<script setup lang="ts">
import { useNav } from '../composables/useNav'
import VbLogo from './VbLogo.vue'
const { link, anchor } = useNav()
</script>

<style>
.ft { background: var(--bg-page); border-top: 1px solid var(--border); padding: 56px var(--gutter) 40px; }
.ft__grid { max-width: var(--container); margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 32px; }
.ft__copy { font-size: 13.5px; color: var(--text-muted); margin-top: 16px; }
.ft__title { font-size: 13px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--text-heading); margin-bottom: 14px; }
.ft__links { display: flex; flex-direction: column; gap: 10px; font-size: 15px; }
.ft__links a { color: var(--text-muted); align-self: flex-start; border-radius: 4px; transition: color var(--dur) var(--ease); }
.ft__links a:hover { color: var(--accent); }
@media (max-width: 860px) {
  .ft { padding: 40px 20px 96px; }
  .ft__grid { grid-template-columns: 1fr 1fr; gap: 28px 24px; }
  .ft__grid > :first-child { grid-column: 1 / -1; }
}
/* Zoom 200 % d'un téléphone (≈195 px, lot 70P) : une seule colonne. */
@media (max-width: 300px) {
  .ft { padding-inline: 14px; }
  .ft__grid { grid-template-columns: minmax(0, 1fr); gap: 24px; }
  .ft__links a { overflow-wrap: anywhere; }
}
</style>
