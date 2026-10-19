<template>
<section id="cas-usage" class="vb-section vb-section--brume uc">
  <div class="vb-container">
    <div class="uc__intro">
      <span class="vb-eyebrow">Cas d'usage</span>
      <h2 class="vb-h2 uc__title">Utile au quotidien. Décisif quand il faut agir.</h2>
      <p class="vb-text">Verebona vous aide à retrouver, suivre et documenter vos biens au fil du temps, puis à réunir les bonnes pièces lorsqu'un événement arrive.</p>
    </div>
    <!-- Types de biens : BANDEAU DÉFILANT (lot 71P, retour du défilement
         continu d'avant le lot 66, décision PO du 19/10) — liste de mots qui
         défile en continu, dans le style de la charte. Accessibilité
         (WCAG 2.2.2) : bouton visible « Mettre en pause / Reprendre le
         défilement » ; pause au survol ; arrêt durable dès que le focus clavier
         entre dans le bandeau (il ne reprend que sur demande, via le bouton) ;
         prefers-reduced-motion : aucun mouvement, liste statique lisible et
         bouton masqué. La liste n'existe qu'une fois pour les lecteurs
         d'écran : la copie qui sert à la boucle est `aria-hidden` et n'est
         ajoutée qu'après le montage (absente du HTML prérendu). Le bandeau
         découpe son contenu : aucun débordement horizontal de la page. -->
    <div :class="['uc__kinds', ready ? 'uc__kinds--ready' : '', paused ? 'uc__kinds--paused' : '']"
      @focusin="onFocusIn" @pointerdown="onPointerDown" @pointerup="releasePointer" @pointercancel="releasePointer">
      <div class="uc__kinds-head">
        <p id="uc-kinds-title" class="uc__kinds-title">Les biens que Verebona prend en charge</p>
        <button type="button" class="uc__kinds-toggle" aria-controls="uc-kinds" @click="toggle">
          <VbIcon :name="paused ? 'play' : 'pause'" :size="16" />
          <span>{{ paused ? 'Reprendre' : 'Mettre en pause' }}<span class="sr-only"> le défilement</span></span>
        </button>
      </div>
      <div class="uc__marquee">
        <div class="uc__marquee-track">
          <ul id="uc-kinds" class="uc__marquee-list" aria-labelledby="uc-kinds-title">
            <li v-for="k in kinds" :key="k" class="uc__marquee-item">{{ k }}</li>
          </ul>
          <ul v-if="ready" class="uc__marquee-list uc__marquee-list--copy" aria-hidden="true">
            <li v-for="k in kinds" :key="k" class="uc__marquee-item">{{ k }}</li>
          </ul>
        </div>
      </div>
    </div>
    <div v-for="group in ucGroups" :key="group.label" class="uc__group">
      <div class="uc__group-label">{{ group.label }}</div>
      <div class="vb-card uc__list">
        <div v-for="(item, vi0) in group.items" :key="vi0" class="uc__item">
          <button type="button" :aria-expanded="item.open" :aria-controls="item.panelId" :class="['uc__head', item.open ? 'uc__head--open' : '']" @click.prevent="item.onClick">
            <span :class="['vb-badge', item.open ? '' : 'vb-badge--outline', 'uc__badge']">{{ item.badge }}</span>
            <span class="uc__item-title">{{ item.title }}</span>
            <VbIcon name="chevronRight" :size="18" class="uc__chev" />
          </button>
          <template v-if="item.open">
            <div :id="item.panelId" role="region" class="uc__panel">
              <p class="uc__scenario">{{ item.scenario }}</p>
              <div class="uc__cols r-stack">
                <div class="uc__col uc__col--without">
                  <div class="uc__col-title">Sans Verebona</div>
                  <div v-for="(w, vi1) in item.without" :key="vi1" class="uc__line"><span class="uc__mark uc__mark--x" aria-hidden="true">✕</span>{{ w }}</div>
                </div>
                <div class="uc__col uc__col--with">
                  <div class="uc__col-title">Avec Verebona</div>
                  <div v-for="(g, vi2) in item.withSteps" :key="vi2" class="uc__line"><span class="uc__mark" aria-hidden="true">✓</span>{{ g }}</div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useLanding } from '../composables/useLanding'
import VbIcon from '../components/VbIcon.vue'

const { ucGroups } = useLanding()

/** Ordre prévu par le design (bandeau des types de biens d'avant le lot 66). */
const kinds = ['Voiture', 'Appartement', 'Garage', 'Moto', 'Maison', 'Terrain', 'Vélo', 'Local commercial', 'Loisir / Sport', 'Électronique']

// Copie de boucle et animation seulement côté navigateur, après le montage :
// le HTML prérendu ne contient qu'une liste, immobile.
const ready = ref(false)
onMounted(() => { ready.value = true })

/** Arrêt demandé (bouton) ou imposé par l'arrivée du focus clavier. */
const paused = ref(false)
function toggle() { paused.value = !paused.value; pointer = false }

// Un clic ou un toucher peut aussi donner le focus au bouton : seul le focus
// CLAVIER arrête le bandeau (sinon un clic sur « Mettre en pause » le
// relancerait aussitôt). Deux garde-fous : pointeur en cours d'usage, et
// `:focus-visible` (faux pour un focus donné à la souris ou au doigt).
let pointer = false
let pointerTimer = 0
function onPointerDown() { window.clearTimeout(pointerTimer); pointer = true }
function releasePointer() { window.clearTimeout(pointerTimer); pointerTimer = window.setTimeout(() => { pointer = false }, 600) }
function onFocusIn(e: FocusEvent) {
  if (pointer) return
  let keyboard = true
  try { keyboard = (e.target as Element).matches(':focus-visible') } catch { /* sélecteur non pris en charge : on arrête */ }
  if (keyboard) paused.value = true
}
</script>

<style>
.uc__intro { max-width: 700px; margin-bottom: 28px; }
.uc__title { margin-bottom: 14px; }
/* Bandeau des types de biens — mots en Figtree, pétrole sur brume (texte
   réel, contraste AA), séparés par un point cuivre décoratif ; filets 1 px. */
.uc__kinds { margin: 0 0 40px; }
.uc__kinds-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--sp-3); margin: 0 0 var(--sp-3); }
.uc__kinds-title { font-size: 14px; letter-spacing: .06em; text-transform: uppercase; font-weight: 700; color: var(--text-heading); margin: 0 0 0 4px; }
.uc__kinds-toggle {
  display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 16px; border-radius: var(--radius-pill);
  border: 1px solid var(--accent); background: var(--bg-card); color: var(--accent); font: inherit; font-size: 14px; font-weight: 600; cursor: pointer;
  transition: background-color var(--dur) var(--ease);
}
.uc__kinds-toggle:hover { background: var(--accent-soft); }
.uc__marquee { overflow: hidden; border-block: 1px solid var(--border); }
.uc__marquee-track { display: flex; width: max-content; }
.uc__marquee-list { display: flex; flex-shrink: 0; margin: 0; padding: 0; list-style: none; }
.uc__marquee-item {
  display: flex; align-items: center; gap: 28px; padding: 18px 28px 18px 0; white-space: nowrap;
  font-size: 30px; line-height: 1.2; font-weight: 700; letter-spacing: -.02em; color: var(--text-heading);
}
.uc__marquee-item::after { content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--vb-cuivre); }
/* Défilement continu (après montage) : la piste porte deux listes
   identiques ; un décalage de -50 % ramène exactement au point de départ. */
.uc__kinds--ready .uc__marquee-track { animation: uc-marquee 48s linear infinite; }
.uc__kinds--paused .uc__marquee-track, .uc__marquee:hover .uc__marquee-track { animation-play-state: paused; }
@keyframes uc-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
/* Mouvement réduit : aucun défilement, liste statique lisible (qui passe à
   la ligne), copie de boucle retirée, bouton inutile masqué. */
@media (prefers-reduced-motion: reduce) {
  .uc__kinds .uc__marquee-track { display: block; animation: none !important; transform: none; width: auto; }
  .uc__marquee-list { flex-wrap: wrap; flex-shrink: 1; min-width: 0; }
  .uc__marquee-list--copy, .uc__kinds-toggle { display: none; }
  .uc__marquee-item { font-size: 22px; padding: 8px 20px 8px 0; gap: 20px; }
}
.uc__group { max-width: 920px; margin: 0 auto 32px; }
.uc__group-label { font-size: 14px; letter-spacing: .06em; text-transform: uppercase; font-weight: 700; color: var(--text-heading); margin: 0 0 14px 4px; }
.uc__list { overflow: hidden; }
.uc__item + .uc__item { border-top: 1px solid var(--border-subtle); }
.uc__head {
  display: flex; align-items: center; gap: 13px; width: 100%; text-align: left; padding: 16px 20px; cursor: pointer;
  background: transparent; border: 0; border-left: 3px solid transparent; transition: background-color var(--dur) var(--ease);
}
.uc__head:hover { background: var(--bg-page); }
.uc__head--open { border-left-color: var(--accent); background: var(--bg-page); }
.uc__badge { flex-shrink: 0; }
.uc__item-title { flex: 1; font-size: 16.5px; font-weight: 700; color: var(--text-primary); }
.uc__chev { color: var(--accent); flex-shrink: 0; transition: transform var(--dur) var(--ease); }
.uc__head--open .uc__chev { transform: rotate(90deg); }
.uc__panel { padding: 4px 22px 24px 36px; background: var(--bg-page); }
.uc__scenario { font-size: 15.5px; line-height: 1.55; color: var(--text-muted); margin: 0 0 18px; }
.uc__cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.uc__col { padding: 16px 18px; border-radius: var(--radius-md); }
.uc__col--without { background: var(--bg-card); border: 1px solid var(--border); }
.uc__col--with { background: var(--accent-soft); }
.uc__col-title { font-size: 12.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 12px; color: var(--text-heading); }
.uc__col--without .uc__col-title { color: var(--attention); }
.uc__line { display: flex; gap: 9px; font-size: 15px; line-height: 1.5; color: var(--text-primary); margin-bottom: 10px; }
.uc__line:last-child { margin-bottom: 0; }
.uc__mark { color: var(--accent); font-weight: 700; flex-shrink: 0; }
.uc__mark--x { color: var(--attention); }
@media (max-width: 860px) {
  .uc__kinds { margin-bottom: 32px; }
  /* Bandeau pleine largeur : il va jusqu'aux bords de l'écran (et les découpe). */
  .uc__marquee { margin-inline: -20px; padding-inline: 20px; }
  .uc__marquee-item { font-size: 22px; gap: 20px; padding: 14px 20px 14px 0; }
  .uc__head { padding: 14px 14px; align-items: flex-start; }
  .uc__panel { padding: 4px 16px 20px; }
}
</style>
