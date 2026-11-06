<template>
<!--
  Lot 113 (#709) — « Revenir en haut ». Bouton discret, absent tant que la
  page n'a pas défilé (aucun arrêt de tabulation inutile en haut de page).
  Le libellé est porté par `aria-label` (l'icône est décorative) et repris en
  infobulle (`title`) à la souris.
-->
<Transition name="vb-top">
  <button
    v-if="visible || focused"
    type="button"
    class="vb-top"
    aria-label="Revenir en haut de la page"
    title="Revenir en haut de la page"
    data-testid="back-to-top"
    @click="goTop"
    @focus="focused = true"
    @blur="focused = false"
  >
    <VbIcon name="arrowUp" :size="22" />
  </button>
</Transition>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import VbIcon from './VbIcon.vue'
import { backToTopBehavior, backToTopVisible } from './back-to-top'

const visible = ref(false)
// Tant qu'il a le focus, le bouton reste rendu : le focus clavier n'est
// jamais perdu dans le vide si la page remonte par un autre moyen.
const focused = ref(false)

function reducedMotion(): boolean {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false }
}

/**
 * Remonte en haut (défilement doux, ou instantané si le visiteur a demandé
 * moins d'animations), puis place le focus sur le logo de l'en-tête : le
 * parcours clavier reprend en haut de page, comme après un chargement.
 */
function goTop() {
  const behavior = backToTopBehavior(reducedMotion())
  try { window.scrollTo({ top: 0, behavior }) } catch { window.scrollTo(0, 0) }
  const target = document.querySelector<HTMLElement>('header a[aria-label="Verebona — accueil"]')
  focused.value = false
  if (target) target.focus({ preventScroll: true })
}

let onScroll: (() => void) | null = null
onMounted(() => {
  onScroll = () => { visible.value = backToTopVisible(window.scrollY, window.innerHeight) }
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => {
  if (!onScroll) return
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})
</script>

<style>
/*
  Aplat blanc, filet pétrole, ombre de carte : pas de flou ni de transparence
  (readme « Fonds »). 44 px : cible tactile minimale. En bas à droite — le
  sélecteur de prévisualisation (préprod) est en bas à gauche.
*/
.vb-top {
  position: fixed; right: 16px; bottom: 16px; z-index: 55;
  width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center;
  border-radius: 50%; border: 1px solid var(--accent); background: var(--bg-card); color: var(--accent);
  box-shadow: var(--shadow-card); cursor: pointer;
  transition: background-color var(--dur) var(--ease), opacity var(--dur) var(--ease);
}
.vb-top:hover { background: var(--accent-soft); }
.vb-top-enter-from, .vb-top-leave-to { opacity: 0; }
@media (min-width: 861px) {
  .vb-top { right: 24px; bottom: 24px; }
}
/* Accueil mobile : au-dessus de la barre d'essai fixe (MobileFixedCta), jamais dessus. */
@media (max-width: 860px) {
  .vb-site:has(.mcta) .vb-top { bottom: 88px; }
}
</style>
