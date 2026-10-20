<template>
<section id="how" class="vb-section how">
  <div class="vb-container how__grid r-stack">
    <div>
      <span class="vb-eyebrow">Comment ça marche</span>
      <h2 class="vb-h2 how__title">Vous déposez. <span class="vb-accent">Verebona organise.</span></h2>
      <p class="vb-text">Ajoutez vos documents. Verebona les comprend, les relie à vos biens, complète vos informations et prépare vos prochaines échéances.</p>
      <div class="how__steps">
        <button v-for="(s, i) in steps" :key="i" type="button" :aria-pressed="demo === i" class="how__step" @click.prevent="select(i)">
          <span class="how__num">{{ s.num }}</span>
          <span><span class="how__step-title">{{ s.title }}</span><span class="how__step-desc">{{ s.desc }}</span></span>
        </button>
      </div>
    </div>

    <div>
      <div aria-live="polite" class="vb-card how__demo">
        <template v-if="demo === 0">
          <!-- Lot 72G (demande PO du 19/10) : des documents (facture, contrat,
               photo) arrivent dans le dossier Verebona. Animation CSS légère,
               jouée UNE fois quand l'illustration apparaît à l'écran (moins de
               3 s, translation + opacité, sans rebond) ; prefers-reduced-motion
               ou absence de JavaScript : image fixe (documents déjà rangés).
               Illustration décorative ; la légende est du texte réel. -->
          <div class="how__drop">
            <div ref="inbox" :class="['how__inbox', armed ? 'how__inbox--armed' : '', play ? 'how__inbox--play' : '']" aria-hidden="true">
              <span class="how__folder-back"></span>
              <span class="how__doc how__doc--1"><span class="how__doc-head"><span class="how__doc-ico"><VbIcon name="euro" :size="12" /></span>Facture</span><span class="how__doc-bar"></span><span class="how__doc-bar how__doc-bar--short"></span></span>
              <span class="how__doc how__doc--2"><span class="how__doc-head"><span class="how__doc-ico"><VbIcon name="file" :size="12" /></span>Contrat</span><span class="how__doc-bar"></span><span class="how__doc-bar how__doc-bar--short"></span></span>
              <span class="how__doc how__doc--3"><span class="how__doc-head">Photo</span><img src="/assets/appartement-lyon.webp" alt="" width="76" height="40" loading="lazy" decoding="async" class="how__doc-photo" /></span>
              <span class="how__folder-front">
                <VbLogo :size="18" inverse />
                <span class="how__folder-done"><VbIcon name="check" :size="13" />3 documents rangés</span>
              </span>
            </div>
            <div class="how__muted how__center">Photo, PDF ou email — déposé tel quel.</div>
          </div>
        </template>
        <template v-if="demo === 1">
          <div class="how__stack">
            <div class="how__file how__file--wide"><VbIcon name="file" :size="16" class="how__accent" /><span class="how__file-name">facture-chaudiere-2026.pdf</span><span class="how__status">Analyse…</span></div>
            <div class="how__kv"><span class="how__k">Bien identifié</span><span class="how__v">Appartement Lyon</span></div>
            <div class="how__kv"><span class="how__k">Catégorie</span><span class="how__v">Facture · Entretien chaudière</span></div>
            <div class="how__kv"><span class="how__k">Infos utiles</span><span class="how__v">145,00 € · 12/03/2026</span></div>
          </div>
        </template>
        <template v-if="demo === 2">
          <div class="how__stack">
            <div class="how__asset">
              <div class="how__asset-head">
                <img src="/assets/appartement-lyon.webp" alt="" class="how__thumb" />
                <div class="how__grow"><div class="how__v">Appartement Lyon</div><div class="how__muted">Fiche complétée automatiquement</div></div>
                <span class="vb-badge">✓ Classé</span>
              </div>
              <div class="how__line"><VbIcon name="check" :size="14" class="how__accent" />Facture · Entretien chaudière · 145,00 €</div>
            </div>
            <div class="how__kv how__kv--due">
              <span class="vb-tile vb-tile--sm"><VbIcon name="calendar" :size="18" /></span>
              <div class="how__grow"><div class="how__v">Prochaine échéance détectée</div><div class="how__muted">Entretien annuel chaudière · mars 2027 · rappel programmé</div></div>
            </div>
          </div>
        </template>
      </div>
      <template v-if="showMascot">
        <div class="how__mascot-row">
          <img src="/assets/mascot/document-analysis-pdf.webp" alt="" width="96" height="96" class="vb-mascot how__mascot" />
          <div class="vb-bubble how__bubble">{{ mascotSays }}</div>
        </div>
      </template>
    </div>
  </div>
</section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useLanding } from '../composables/useLanding'
import VbIcon from '../components/VbIcon.vue'
import VbLogo from '../components/VbLogo.vue'

const { showMascot } = useLanding()

// Démo interactive en 3 états : dépôt → analyse → fiche + échéance.
// Lot 69P : plus d'auto-défilement (il changeait le contenu toutes les 3,6 s
// sans action de l'utilisateur) — l'état change uniquement au choix d'une étape.
const demo = ref(0)
const select = (i: number) => { demo.value = i }

// Animation du dépôt (lot 72G) : armée au montage de l'illustration (documents
// masqués), jouée une seule fois dès qu'elle est visible à l'écran. Sans
// IntersectionObserver ou en mouvement réduit : rien n'est armé, l'image
// reste fixe (documents déjà dans le dossier).
const inbox = ref<HTMLElement | null>(null)
const armed = ref(false)
const play = ref(false)
let io: IntersectionObserver | null = null
function stopObserving() { io?.disconnect(); io = null }
watch(inbox, (el) => {
  stopObserving()
  armed.value = false
  play.value = false
  if (!el || typeof IntersectionObserver === 'undefined') return
  try { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return } catch { return }
  armed.value = true
  io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { play.value = true; stopObserving() }
  }, { threshold: 0.5 })
  io.observe(el)
})
onBeforeUnmount(stopObserving)

const mascotSays = computed(() => [
  "« Je réceptionne votre document, je regarde ce qu'il contient. »",
  "« J'ai reconnu l'Appartement Lyon, la catégorie et le montant. »",
  "« J'ai classé cette facture et repéré la prochaine échéance. »",
][demo.value])

const steps = [
  { num: '01', title: 'Vous déposez', desc: 'Ajoutez vos documents comme ils viennent : factures, contrats, diagnostics, garanties, photos.' },
  { num: '02', title: 'Verebona organise', desc: 'Verebona analyse vos documents, les classe, les rattache aux bons biens et extrait les informations utiles.' },
  { num: '03', title: "Vous gardez l'essentiel sous la main", desc: 'Vos échéances, dossiers, documents et informations importantes sont prêts quand vous en avez besoin.' },
]
</script>

<style>
.how__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
.how__title { margin-bottom: 14px; }
.how__steps { display: flex; flex-direction: column; gap: 8px; margin-top: 32px; }
.how__step {
  display: flex; gap: 18px; text-align: left; width: 100%; padding: 16px 18px; border-radius: var(--radius-md); cursor: pointer;
  border: 1px solid transparent; background: transparent; transition: background-color var(--dur) var(--ease), border-color var(--dur) var(--ease);
}
.how__step:hover { background: var(--accent-soft); }
.how__step[aria-pressed="true"] { background: var(--bg-card); border-color: var(--border); }
.how__num { font-size: 15px; font-weight: 700; color: var(--attention); padding-top: 4px; flex-shrink: 0; }
.how__step-title { display: block; font-size: 19px; font-weight: 700; color: var(--text-heading); margin-bottom: 4px; }
.how__step-desc { display: block; font-size: 15.5px; line-height: 1.55; color: var(--text-muted); }

.how__demo { padding: 18px; min-height: 290px; display: flex; flex-direction: column; justify-content: center; }
.how__drop { display: flex; flex-direction: column; align-items: center; gap: 14px; border-radius: var(--radius-md); background: var(--bg-page); padding: 24px 18px 20px; }
/* Dossier Verebona (lot 72G) : dos et façade pétrole, documents glissés entre
   les deux (aplats, bordures 1 px). État de repos = image fixe. */
.how__inbox { position: relative; width: 272px; max-width: 100%; height: 190px; flex-shrink: 0; }
.how__folder-back { position: absolute; left: 0; right: 0; bottom: 0; height: 128px; border-radius: var(--radius-md); background: var(--accent-hover); z-index: 1; }
.how__folder-back::before { content: ''; position: absolute; left: 0; top: -14px; width: 92px; height: 22px; border-radius: 10px 10px 0 0; background: var(--accent-hover); }
.how__folder-front {
  position: absolute; left: 0; right: 0; bottom: 0; height: 92px; z-index: 3; border-radius: var(--radius-md); background: var(--accent);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: var(--vb-ivoire);
}
.how__folder-done { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; }
.how__doc {
  position: absolute; bottom: 44px; z-index: 2; width: 84px; height: 112px; padding: 9px 7px; border-radius: var(--radius-sm);
  background: var(--bg-card); border: 1px solid var(--border); display: flex; flex-direction: column; gap: 7px;
  transform: rotate(var(--r, 0deg)); transform-origin: 50% 100%;
}
.how__doc--1 { left: 12px; --r: -7deg; }
.how__doc--2 { left: 94px; bottom: 50px; }
.how__doc--3 { left: 176px; --r: 7deg; }
.how__doc-head { display: flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 700; color: var(--text-primary); }
.how__doc-ico { width: 18px; height: 18px; border-radius: 6px; background: var(--accent-soft); color: var(--accent); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.how__doc-bar { height: 5px; border-radius: 3px; background: var(--border-subtle); }
.how__doc-bar--short { width: 60%; }
.how__doc-photo { width: 100%; height: 40px; border-radius: 6px; object-fit: cover; }
/* Lecture unique à l'apparition : chaque document descend dans le dossier
   (translation + opacité, courbe de la charte, sans rebond), puis la mention
   « rangés » apparaît. Durée totale < 3 s, aucune boucle. */
.how__inbox--armed .how__doc, .how__inbox--armed .how__folder-done { opacity: 0; }
.how__inbox--play .how__doc { animation: how-drop 800ms var(--ease) both; }
.how__inbox--play .how__doc--1 { animation-delay: 150ms; }
.how__inbox--play .how__doc--2 { animation-delay: 700ms; }
.how__inbox--play .how__doc--3 { animation-delay: 1250ms; }
.how__inbox--play .how__folder-done { animation: how-fade 400ms var(--ease) 2100ms both; }
@keyframes how-drop { from { opacity: 0; transform: translateY(-84px) rotate(var(--r, 0deg)); } to { opacity: 1; transform: translateY(0) rotate(var(--r, 0deg)); } }
@keyframes how-fade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .how__inbox .how__doc, .how__inbox .how__folder-done { animation: none !important; opacity: 1 !important; }
}
.how__accent { color: var(--accent); }
.how__muted { font-size: 13px; color: var(--text-muted); }
.how__center { text-align: center; }
.how__file { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: var(--radius-md); background: var(--bg-card); border: 1px solid var(--border); }
.how__file--wide { padding: 10px 14px; }
.how__file-name { font-size: 13px; font-weight: 700; color: var(--text-primary); }
.how__status { margin-left: auto; font-size: 12px; font-weight: 700; color: var(--attention); }
.how__stack { display: flex; flex-direction: column; gap: 9px; }
.how__kv { display: flex; align-items: center; gap: 10px; padding: 10px 13px; border-radius: 10px; background: var(--accent-soft); }
.how__kv--due { gap: 12px; padding: 12px 14px; background: var(--bg-page); border: 1px solid var(--border); }
.how__k { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--accent); width: 112px; flex-shrink: 0; }
.how__v { font-size: 13.5px; font-weight: 700; color: var(--text-primary); }
.how__asset { border-radius: var(--radius-md); background: var(--bg-card); border: 1px solid var(--border); padding: 13px 14px; }
.how__asset-head { display: flex; align-items: center; gap: 11px; margin-bottom: 10px; }
.how__thumb { width: 38px; height: 38px; border-radius: 9px; object-fit: cover; flex-shrink: 0; }
.how__grow { flex: 1; min-width: 0; }
.how__line { display: flex; align-items: center; gap: 9px; padding: 8px 11px; border-radius: 9px; background: var(--bg-page); font-size: 12.5px; color: var(--text-primary); }
.how__mascot-row { display: grid; grid-template-columns: 96px minmax(0, 1fr); gap: 0 20px; align-items: start; margin-top: 16px; }
.how__mascot { width: 96px; }
.how__bubble { margin-top: 8px; }
@media (max-width: 860px) {
  .how__grid { gap: 36px; }
  .how__inbox { width: 256px; }
  .how__doc--1 { left: 6px; }
  .how__doc--2 { left: 86px; }
  .how__doc--3 { left: 166px; }
  .how__mascot-row { grid-template-columns: 72px minmax(0, 1fr); gap: 0 14px; }
  .how__mascot { width: 72px; }
}
</style>
