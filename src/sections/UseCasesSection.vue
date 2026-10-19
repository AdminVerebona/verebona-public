<template>
<section id="cas-usage" class="vb-section vb-section--brume uc">
  <div class="vb-container">
    <div class="uc__intro">
      <span class="vb-eyebrow">Cas d'usage</span>
      <h2 class="vb-h2 uc__title">Utile au quotidien. Décisif quand il faut agir.</h2>
      <p class="vb-text">Verebona vous aide à retrouver, suivre et documenter vos biens au fil du temps, puis à réunir les bonnes pièces lorsqu'un événement arrive.</p>
    </div>
    <!-- Types de biens : carrousel horizontal NATIF piloté par l'utilisateur
         (lot 69P) — swipe, flèches du clavier sur la piste, boutons
         précédent / suivant ; carte suivante partiellement visible ; aucun
         défilement automatique (charte : pas de mouvement continu). Cartes
         non interactives : rien de focalisable hors écran. -->
    <div class="uc__kinds-wrap vb-carousel vb-carousel--bleed" role="region" aria-roledescription="carrousel" aria-labelledby="uc-kinds-title">
      <p id="uc-kinds-title" class="uc__kinds-title">Les biens que Verebona prend en charge</p>
      <ul id="uc-kinds" ref="kindsTrack" class="vb-carousel__track uc__kinds" tabindex="0" aria-label="Types de biens, défilement horizontal">
        <li v-for="k in kinds" :key="k.name" class="uc__kind">
          <span class="vb-tile vb-tile--sm uc__kind-ico"><VbIcon :name="k.icon" :size="20" /></span>
          <span class="uc__kind-name">{{ k.name }}</span>
          <span class="uc__kind-ex">{{ k.examples }}</span>
        </li>
      </ul>
      <CarouselControls v-if="kindsCar.overflow.value" controls="uc-kinds" prev-label="Types de biens précédents" next-label="Types de biens suivants"
        :at-start="kindsCar.atStart.value" :at-end="kindsCar.atEnd.value" :count="kinds.length"
        :first="kindsCar.first.value" :last="kindsCar.last.value" :position="kindsPosition" :status="kindsCar.status.value"
        @prev="kindsCar.prev" @next="kindsCar.next" />
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
import { computed } from 'vue'
import { useLanding } from '../composables/useLanding'
import { useScrollCarousel } from '../composables/useScrollCarousel'
import VbIcon from '../components/VbIcon.vue'
import CarouselControls from '../components/CarouselControls.vue'
import type { IconName } from '../components/icons'

const { ucGroups } = useLanding()

/** Ordre prévu par le design (ancien bandeau des types de biens). */
const kinds: Array<{ name: string; icon: IconName; examples: string }> = [
  { name: 'Voiture', icon: 'car', examples: 'Carte grise, assurance, entretiens' },
  { name: 'Appartement', icon: 'building', examples: 'Bail, diagnostics, charges' },
  { name: 'Garage', icon: 'garage', examples: 'Acte, taxe foncière, travaux' },
  { name: 'Moto', icon: 'moto', examples: 'Carte grise, révisions, équipement' },
  { name: 'Maison', icon: 'home', examples: 'Travaux, chaudière, assurance' },
  { name: 'Terrain', icon: 'terrain', examples: 'Acte, bornage, taxe foncière' },
  { name: 'Vélo', icon: 'bike', examples: 'Facture, garantie, révisions' },
  { name: 'Local commercial', icon: 'store', examples: 'Bail, assurance, conformité' },
  { name: 'Loisir / Sport', icon: 'leisure', examples: 'Factures, garanties, entretien' },
  { name: 'Électronique', icon: 'laptop', examples: 'Factures, garanties, notices' },
]

const kindsCar = useScrollCarousel({
  count: kinds.length,
  step: 'page',
  announce: (f, l) => (f === l ? `${kinds[f].name}, type ${f + 1} sur ${kinds.length}` : `Types ${f + 1} à ${l + 1} sur ${kinds.length} : ${kinds.slice(f, l + 1).map((k) => k.name).join(', ')}`),
})
const kindsTrack = kindsCar.track
const kindsPosition = computed(() => {
  const f = kindsCar.first.value + 1
  const l = kindsCar.last.value + 1
  return f === l ? `${f} / ${kinds.length}` : `${f}–${l} / ${kinds.length}`
})
</script>

<style>
.uc__intro { max-width: 700px; margin-bottom: 28px; }
.uc__title { margin-bottom: 14px; }
.uc__kinds-wrap { margin: 0 0 40px; }
.uc__kinds-title { font-size: 14px; letter-spacing: .06em; text-transform: uppercase; font-weight: 700; color: var(--text-heading); margin: 0 0 6px 4px; }
.uc__kind {
  width: 176px; display: flex; flex-direction: column; gap: 6px; padding: 14px 16px 16px;
  border-radius: var(--radius-lg); border: 1px solid var(--bubble-edge); background: var(--bg-page);
}
.uc__kind-ico { margin-bottom: 4px; }
.uc__kind-name { font-size: 16px; font-weight: 700; color: var(--text-primary); line-height: 1.25; }
.uc__kind-ex { font-size: 13.5px; line-height: 1.4; color: var(--text-muted); }
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
  .uc__kinds-wrap { margin-bottom: 32px; }
  /* ~2,3 cartes visibles : la suivante dépasse et signale la suite. */
  .uc__kind { width: min(146px, 38vw); padding: 12px 14px 14px; }
  .uc__head { padding: 14px 14px; align-items: flex-start; }
  .uc__panel { padding: 4px 16px 20px; }
}
</style>
