<template>
<section id="cas-usage" class="vb-section vb-section--brume uc">
  <div class="vb-container">
    <div class="uc__intro">
      <span class="vb-eyebrow">Cas d'usage</span>
      <h2 class="vb-h2 uc__title">Utile au quotidien. Décisif quand il faut agir.</h2>
      <p class="vb-text">Verebona vous aide à retrouver, suivre et documenter vos biens au fil du temps, puis à réunir les bonnes pièces lorsqu'un événement arrive.</p>
    </div>
    <!-- Types de biens : BANDEAU DÉFILANT (lot 71P, décision PO du 19/10).
         Lot 72G (demande PO du 19/10) : ni surtitre ni bouton « Mettre en
         pause » — seul le bandeau de mots défile. Alternative WCAG 2.2.2
         sans bouton visible : pause au survol VOLONTAIRE de la souris ;
         pause pendant le focus clavier (le bandeau devient un arrêt de
         tabulation, nommé) ; un clic souris l'arrête jusqu'à ce que le
         pointeur le quitte ; un toucher arrête / relance le défilement.
         Lot 76P (PO : « ne tourne pas en web ») : sur ordinateur, la pause
         CSS au simple survol l'arrêtait dès que la molette l'amenait sous un
         pointeur immobile, et clic / focus l'arrêtaient pour de bon — il
         reprend désormais toujours en quittant le bandeau ou le focus ;
         prefers-reduced-motion : aucun mouvement, liste statique lisible, pas
         d'arrêt de tabulation. La liste n'existe qu'une fois pour les lecteurs
         d'écran (nommée par aria-label) : la copie de boucle est `aria-hidden`
         et n'est ajoutée qu'après le montage (absente du HTML prérendu). Le
         bandeau découpe son contenu : aucun débordement horizontal. -->
    <div :class="['uc__kinds', ready ? 'uc__kinds--ready' : '', paused ? 'uc__kinds--paused' : '']">
      <div class="uc__marquee" :tabindex="moving ? 0 : undefined" :role="moving ? 'group' : undefined"
        :aria-label="moving ? KINDS_HINT : undefined"
        @focusin="onFocusIn" @focusout="onFocusOut" @pointerdown="onPointerDown" @pointerup="releasePointer" @pointercancel="releasePointer"
        @pointermove="onPointerMove" @pointerleave="onPointerLeave" @click="toggle">
        <div class="uc__marquee-track">
          <ul id="uc-kinds" class="uc__marquee-list" aria-label="Les biens que Verebona prend en charge">
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
          <!-- Lot 76P (« Alignement ! ») : grille étiquette | titre | chevron. La
               colonne d'étiquettes prend la largeur de la plus large de TOUTES
               les étiquettes (gabarit invisible `data-sizer`, pseudo-élément ni
               lu ni annoncé) : les titres commencent sur la même verticale. -->
          <button type="button" :aria-expanded="item.open" :aria-controls="item.panelId" :class="['uc__head', item.open ? 'uc__head--open' : '']" @click.prevent="item.onClick">
            <span class="uc__tag" :data-sizer="badgeSizer"><span :class="['vb-badge', item.open ? '' : 'vb-badge--outline', 'uc__badge']">{{ item.badge }}</span></span>
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useLanding } from '../composables/useLanding'
import VbIcon from '../components/VbIcon.vue'

const { ucGroups } = useLanding()

/** Étiquette la plus longue des deux listes : gabarit de la colonne d'étiquettes. */
const badgeSizer = computed(() => ucGroups.value.flatMap((g) => g.items.map((i) => i.badge))
  .reduce((a, b) => (b.length > a.length ? b : a), ''))

/** Ordre prévu par le design (bandeau des types de biens d'avant le lot 66). */
const kinds = ['Voiture', 'Appartement', 'Garage', 'Moto', 'Maison', 'Terrain', 'Vélo', 'Local commercial', 'Loisir / Sport', 'Électronique']
/** Nom du bandeau quand il défile (et devient focalisable) : dit comment l'arrêter. */
const KINDS_HINT = 'Défilement des types de biens : s’arrête au focus, au survol ou au toucher'

// Copie de boucle et animation seulement côté navigateur, après le montage :
// le HTML prérendu ne contient qu'une liste, immobile.
const ready = ref(false)
/** Mouvement réduit demandé : rien ne bouge, le bandeau n'est pas un arrêt de tabulation. */
const reduced = ref(false)
let mql: MediaQueryList | null = null
const onReduce = (e: MediaQueryListEvent) => { reduced.value = e.matches }
onMounted(() => {
  try {
    mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced.value = mql.matches
    mql.addEventListener?.('change', onReduce)
  } catch { /* matchMedia indisponible : animations considérées actives */ }
  ready.value = true
})
onBeforeUnmount(() => { mql?.removeEventListener?.('change', onReduce) })
const moving = computed(() => ready.value && !reduced.value)

/**
 * Trois causes d'arrêt, chacune levée par l'action inverse (lot 76P) :
 *   - `touchPaused`  toucher / stylet : arrêt, relance au toucher suivant ;
 *   - `mousePaused`  souris déplacée sur le bandeau, ou clic : jusqu'à ce
 *                    que le pointeur quitte le bandeau ;
 *   - `focusPaused`  focus clavier : jusqu'à la sortie du focus.
 */
const touchPaused = ref(false)
const mousePaused = ref(false)
const focusPaused = ref(false)
const paused = computed(() => moving.value && (touchPaused.value || mousePaused.value || focusPaused.value))

let lastPointerType = ''
function toggle() {
  if (!moving.value) return
  if (lastPointerType === 'mouse') mousePaused.value = true
  else touchPaused.value = !touchPaused.value
}

// Survol VOLONTAIRE : un vrai déplacement de la souris sur le bandeau. Quand
// la page défile à la molette sous un pointeur immobile (cas courant sur
// ordinateur), le pointeur n'a pas bougé : le bandeau continue de défiler.
let lastXY: [number, number] | null = null
function onPointerMove(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  const moved = (e.movementX ?? 0) !== 0 || (e.movementY ?? 0) !== 0
    || (lastXY !== null && (lastXY[0] !== e.clientX || lastXY[1] !== e.clientY))
  lastXY = [e.clientX, e.clientY]
  if (moved && moving.value) mousePaused.value = true
}
function onPointerLeave(e: PointerEvent) {
  lastXY = null
  if (e.pointerType === 'mouse') mousePaused.value = false
}

// Un clic ou un toucher donne aussi le focus au bandeau (tabindex) : seul le
// focus CLAVIER l'arrête (sinon le toucher, qui bascule l'état, le
// relancerait aussitôt). Deux garde-fous : pointeur en cours d'usage, et
// `:focus-visible` (faux pour un focus donné à la souris ou au doigt).
let pointer = false
let pointerTimer = 0
function onPointerDown(e: PointerEvent) { window.clearTimeout(pointerTimer); pointer = true; lastPointerType = e.pointerType ?? '' }
function releasePointer() { window.clearTimeout(pointerTimer); pointerTimer = window.setTimeout(() => { pointer = false }, 600) }
function onFocusIn(e: FocusEvent) {
  if (pointer) return
  let keyboard = true
  try { keyboard = (e.target as Element).matches(':focus-visible') } catch { /* sélecteur non pris en charge : on arrête */ }
  if (keyboard) focusPaused.value = true
}
function onFocusOut() { focusPaused.value = false }
</script>

<style>
.uc__intro { max-width: 700px; margin-bottom: 28px; }
.uc__title { margin-bottom: 14px; }
/* Bandeau des types de biens — mots en Figtree, pétrole sur brume (texte
   réel, contraste AA), séparés par un point cuivre décoratif ; filets 1 px. */
.uc__kinds { margin: 0 0 40px; }
.uc__marquee { overflow: hidden; border-block: 1px solid var(--border); }
/* Focus clavier visible à l'intérieur du bandeau (il touche les bords de
   l'écran sur mobile : un contour extérieur serait coupé). */
.uc__marquee:focus-visible { outline-offset: -3px; }
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
.uc__kinds--paused .uc__marquee-track, .uc__marquee:focus-visible .uc__marquee-track { animation-play-state: paused; }
/* Survol : géré en JavaScript (lot 76P, survol VOLONTAIRE de la souris) —
   un `:hover` CSS arrêtait le bandeau sous un pointeur immobile pendant le
   défilement de la page. */
@keyframes uc-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
/* Mouvement réduit : aucun défilement, liste statique lisible (qui passe à
   la ligne), copie de boucle retirée. */
@media (prefers-reduced-motion: reduce) {
  .uc__kinds .uc__marquee-track { display: block; animation: none !important; transform: none; width: auto; }
  .uc__marquee-list { flex-wrap: wrap; flex-shrink: 1; min-width: 0; }
  .uc__marquee-list--copy { display: none; }
  .uc__marquee-item { font-size: 22px; padding: 8px 20px 8px 0; gap: 20px; }
}
.uc__group { max-width: 920px; margin: 0 auto 32px; }
.uc__group-label { font-size: 14px; letter-spacing: .06em; text-transform: uppercase; font-weight: 700; color: var(--text-heading); margin: 0 0 14px 4px; }
.uc__list { overflow: hidden; }
.uc__item + .uc__item { border-top: 1px solid var(--border-subtle); }
.uc__head {
  display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 8px 13px; width: 100%; text-align: left; padding: 16px 20px; cursor: pointer;
  background: transparent; border: 0; border-left: 3px solid transparent; transition: background-color var(--dur) var(--ease);
}
.uc__head:hover { background: var(--bg-page); }
.uc__head--open { border-left-color: var(--accent); background: var(--bg-page); }
.uc__badge { flex-shrink: 0; }
/* Colonne d'étiquettes de largeur commune (lot 76P) : l'étiquette et le
   gabarit invisible de la plus longue (mêmes métriques que .vb-badge :
   12 px / 600, 9 px + 1 px de bordure de chaque côté) partagent la même
   cellule ; la cellule prend la plus grande des deux largeurs. */
.uc__tag { display: grid; justify-items: start; }
.uc__tag > .uc__badge, .uc__tag::after { grid-area: 1 / 1; }
.uc__tag::after {
  content: attr(data-sizer); visibility: hidden; height: 0; padding: 0 10px;
  font-size: 12px; font-weight: 600; line-height: 1.4; white-space: nowrap; pointer-events: none;
}
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
  .uc__head { padding: 14px 14px; align-items: start; }
  .uc__panel { padding: 4px 16px 20px; }
}
/* Zoom 200 % d'un téléphone (≈ 195 px) : plus de place pour deux colonnes —
   l'étiquette passe au-dessus du titre, tous deux alignés à gauche ; chevron
   à droite de l'étiquette. */
@media (max-width: 300px) {
  .uc__head { grid-template-columns: minmax(0, 1fr) auto; }
  .uc__tag::after { display: none; }
  .uc__item-title { grid-column: 1; grid-row: 2; }
  .uc__chev { grid-column: 2; grid-row: 1; }
}
</style>
