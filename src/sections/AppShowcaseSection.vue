<template>
<!-- Application : ordinateur + téléphone (charte 2026 §6). Contenu et
     interactions du carrousel inchangés ; habillage clair de l'application.
     Lot 69P : sur mobile, l'ordinateur n'est plus masqué — il est recomposé
     (menu replié en icônes de 44 px, cadrage partiel) avec le téléphone qui le
     chevauche ; aucun défilement automatique.
     Lot 71P : la visite « Verebona en six vues » (lots 69P / 70P) a quitté
     cette section — fusionnée dans Fonctionnalités (#features, neuf vues). -->
<section class="app">
  <div class="vb-container">
    <ul class="app__tri r-stack">
      <li v-for="t in triptych" :key="t.title" class="vb-card app__tri-item">
        <span class="vb-tile"><VbIcon :name="t.icon" /></span>
        <span><span class="app__tri-title">{{ t.title }}</span><span class="app__tri-text">{{ t.text }}</span></span>
      </li>
    </ul>

    <template v-if="showMockup">
      <p class="vb-text app__intro">L'application Verebona, sur le web et sur mobile <strong>(iOS &amp; Android)</strong> — vos biens, documents et échéances toujours synchronisés.</p>
      <div class="app__devices">
        <!-- Ordinateur -->
        <div class="app__laptop">
          <div class="app__bezel">
            <span class="app__cam" aria-hidden="true"></span>
            <!-- Lot 71 (PO) : captures réelles de l'application, dans l'ordre du
                 carrousel (Accueil, Mes biens, Mon agenda, Mes documents). Le nom de
                 l'écran affiché est annoncé par le carrousel ; images décoratives. -->
            <div class="app__screen app__screen--shot">
              <img v-for="(sc, i) in shots" v-show="slideIndex === i" :key="sc.src" :src="sc.src" alt="" width="1600" height="724" :loading="i === 0 ? 'eager' : 'lazy'" decoding="async" class="app__shot" />
            </div>
          </div>
          <div class="app__base" aria-hidden="true"></div>
        </div>

        <!-- Lot 72G (demande PO du 19/10) : la vignette mobile « Synchronisé »
             (Web · iOS · Android) est supprimée ; l'introduction le dit déjà. -->

        <!-- Téléphone -->
        <div class="app__phone" aria-hidden="true">
          <!-- Lot 71 (PO) : capture réelle de l'accueil mobile (thème sombre),
               décorative — le texte de l'introduction dit déjà l'essentiel. -->
          <div class="app__phone-screen app__phone-screen--shot">
            <img src="/assets/app-mobile-accueil.webp" alt="" width="696" height="1417" loading="lazy" decoding="async" class="app__phone-shot" />
          </div>
        </div>
      </div>

      <!-- Navigation du carrousel -->
      <div class="app__dots">
        <button type="button" class="app__arrow" aria-label="Écran précédent" @click.prevent="prev">‹</button>
        <div class="app__dots-list">
          <button v-for="d in dots" :key="d.label" type="button" :class="['app__dot', d.active ? 'app__dot--on' : '']" :aria-pressed="d.active" :aria-label="`Afficher : ${d.label}`" @click.prevent="d.onClick"></button>
        </div>
        <button type="button" class="app__arrow" aria-label="Écran suivant" @click.prevent="next">›</button>
        <p class="app__now"><span class="sr-only">Écran affiché : </span>{{ slideLabel }}<span class="app__now-pos"> · {{ slideIndex + 1 }} / 4</span></p>
      </div>
      <!-- Annonce polie du seul nom de l'écran (et non de tout son contenu). -->
      <p class="sr-only" aria-live="polite" aria-atomic="true">{{ announced }}</p>
    </template>
  </div>
</section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useLanding } from '../composables/useLanding'
import VbIcon from '../components/VbIcon.vue'
import type { IconName } from '../components/icons'

const { showMockup, nav, dots, slideLabel, prev, next } = useLanding()

const slideIndex = computed(() => nav.value.findIndex((n) => n.active))
// Rien n'est annoncé au chargement ; ensuite, seulement l'écran choisi.
const announced = ref('')
watch(slideLabel, (l) => { announced.value = `Écran affiché : ${l}, ${slideIndex.value + 1} sur 4` })

const triptych: Array<{ icon: IconName; title: string; text: string }> = [
  { icon: 'home', title: 'Biens', text: 'Logements, véhicules, objets' },
  { icon: 'file', title: 'Documents', text: 'Factures, garanties, contrats…' },
  { icon: 'calendar', title: 'Agendas', text: 'Échéances, entretiens, rappels…' },
]

/** Lot 71 : captures réelles, même ordre que `nav` (useLanding). */
const shots = [
  { src: '/assets/app-desktop-accueil.webp' },
  { src: '/assets/app-desktop-biens.webp' },
  { src: '/assets/app-desktop-agenda.webp' },
  { src: '/assets/app-desktop-documents.webp' },
]
</script>

<style>
.app { padding: 72px var(--gutter) 24px; }
.app__tri { list-style: none; margin: 0 0 48px; padding: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.app__tri-item { display: flex; align-items: center; gap: 16px; padding: 20px 22px; }
.app__tri-title { display: block; font-size: 19px; font-weight: 700; color: var(--text-heading); letter-spacing: -.01em; }
.app__tri-text { display: block; font-size: 14.5px; color: var(--text-muted); }
.app__intro { text-align: center; max-width: 640px; margin: 0 auto 28px; }
.app__intro strong { color: var(--text-primary); }

.app__devices { display: flex; align-items: flex-end; gap: 32px; max-width: 1000px; margin: 0 auto; }
.app__laptop { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; }
.app__bezel { width: 92%; background: #1E2A2F; border-radius: 16px 16px 0 0; padding: 16px 14px 18px; border: 1px solid #3A4A51; border-bottom: 0; position: relative; }
.app__cam { position: absolute; top: 6px; left: 50%; transform: translateX(-50%); width: 6px; height: 6px; border-radius: 50%; background: #0B1114; }
.app__base { width: 100%; height: 14px; background: #C9D1CF; border-radius: 3px 3px 11px 11px; }
.app__screen.app__screen--shot { display: block; height: auto; aspect-ratio: 1600 / 724; background: var(--bg-page); }
.app__shot { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top left; }
.app__screen { border-radius: 6px; overflow: hidden; background: var(--bg-page); display: flex; height: 400px; }
.app__b { font-size: 10px; padding: 2px 8px; }

.app__phone { flex-shrink: 0; width: 246px; border-radius: 46px; padding: 7px; background: #1E2A2F; border: 1px solid #3A4A51; }
.app__phone-screen { border-radius: 40px; overflow: hidden; background: var(--bg-page); height: 486px; display: flex; flex-direction: column; }
.app__phone-screen--shot { background: #1B2529; }
.app__phone-shot { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top center; }

.app__dots { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 18px; }
.app__arrow { width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--border); background: var(--bg-card); color: var(--accent); cursor: pointer; font-size: 18px; line-height: 1; }
.app__dots-list { display: flex; gap: 4px; align-items: center; }
.app__dot { width: 24px; height: 24px; border: 0; padding: 0; background: transparent; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; }
.app__dot::before { content: ''; display: block; width: 8px; height: 8px; border-radius: 50%; background: var(--border); transition: background-color var(--dur) var(--ease); }
.app__dot--on::before { background: var(--accent); }

/* Changement d'écran : fondu court (opacité seulement, charte « fond et
   couleur »), neutralisé par prefers-reduced-motion (style.css). */
.app__shot { animation: app-fade 200ms var(--ease); }
@keyframes app-fade { from { opacity: 0; } to { opacity: 1; } }
.app__now { display: none; margin: 0; font-size: var(--fs-meta); font-weight: 700; color: var(--text-primary); }

/* ── Mobile et tablette étroite (lot 69P) : ordinateur + téléphone recomposés ──
   L'ordinateur reste visible (menu replié 64 px de l'application, boutons
   d'icônes de 44 px, contenu recadré) ; le téléphone le chevauche en bas à
   droite, sans couvrir aucun contrôle. Rien n'est masqué par display:none. */
@media (max-width: 860px) {
  .app { padding: 48px 20px 8px; }
  .app .app__tri { margin-bottom: 32px; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(92px, 1fr)) !important; }
  .app__tri-item { flex-direction: column; align-items: flex-start; gap: 10px; padding: 14px; }
  .app__tri-item .vb-tile { width: 40px; height: 40px; border-radius: 10px; }
  .app__tri-title { font-size: 16px; }
  .app__tri-text { font-size: 13.5px; line-height: 1.4; }
  .app__intro { text-align: left; font-size: 16px; margin-bottom: 20px; }

  .app__devices { position: relative; display: block; max-width: 640px; padding-bottom: var(--phone-out, 196px); }
  .app__laptop { width: 100%; align-items: flex-start; }
  .app__bezel { width: 100%; border-radius: 12px 12px 0 0; padding: 10px 8px 10px; }
  .app__cam { top: 3px; width: 4px; height: 4px; }
  .app__base { height: 10px; width: 100%; }
  .app__screen { height: 252px; }

  /* Téléphone : même écran que sur desktop, réduit, au premier plan. */
  .app__phone { position: absolute; right: 0; bottom: 0; transform: scale(var(--phone-k, .56)); transform-origin: 100% 100%; box-shadow: 0 24px 48px rgba(38, 53, 59, .22); }

  .app__dots { flex-wrap: wrap; gap: 8px; margin-top: 14px; }
  .app__arrow { width: 44px; height: 44px; }
  .app__dot { width: 44px; height: 44px; }
  .app__dots-list { gap: 0; }
  .app__now { display: block; flex-basis: 100%; text-align: center; }
}
@media (min-width: 600px) and (max-width: 860px) {
  .app__devices { --phone-k: .7; --phone-out: 170px; margin: 0 auto; }
  .app__laptop { width: 82%; }
  .app__screen { height: 320px; }
}
@media (max-width: 400px) {
}
@media (max-width: 359px) {
  .app__devices { --phone-k: .5; --phone-out: 150px; }
}
/* Très étroit (zoom 200 % d'un téléphone) : la superposition deviendrait
   illisible — les deux supports s'affichent l'un après l'autre. */
@media (max-width: 300px) {
  .app__devices { padding-bottom: 0; }
  .app__phone { position: static; transform: none; zoom: .62; margin: 20px auto 0; }
}
</style>
