<template>
<!-- Bénéfices — bande brume sous le héros (charte 2026 §6, maquette « Bénéfices »).
     Suite directe du héros dans le HTML : H2 puis quatre H3, puis la signature
     (ordre du ticket SEO accueil inchangé).
     Lot 71P : les quatre icônes deviennent des mini-vues (~120 px) dans le
     style de la section Fonctionnalités — vrai texte, décoratif pour les
     lecteurs d'écran (`aria-hidden`) : l'information est portée par le titre
     et la phrase de chaque bénéfice. -->
<section class="vb-band ben" aria-labelledby="ben-title">
  <div class="vb-container">
    <h2 id="ben-title" class="vb-h2 ben__title">Centralisez, organisez, valorisez.</h2>
    <ul class="ben__grid r-stack">
      <li v-for="b in items" :key="b.key" :class="['ben__item', `ben__item--${b.key}`]">
        <div class="ben__view" aria-hidden="true">
          <!-- Retrouvez : champ de recherche + un résultat -->
          <template v-if="b.key === 'search'">
            <span class="ben__search"><VbIcon name="search" :size="15" />garantie lave-linge</span>
            <span class="ben__ui ben__result">
              <span class="ben__ico"><VbIcon name="file" :size="14" /></span>
              <span class="ben__col"><span class="ben__strong">Garantie lave-linge</span><span class="ben__meta">Maison · jusqu’au 03/2027</span></span>
            </span>
          </template>
          <!-- Anticipez : deux pastilles de date -->
          <template v-else-if="b.key === 'dates'">
            <span class="ben__dates">
              <span class="ben__ui ben__due"><span class="ben__date"><b>12</b>MARS</span><span class="ben__strong">Chaudière</span></span>
              <span class="ben__ui ben__due"><span class="ben__date ben__date--soon"><b>01</b>JANV</span><span class="ben__strong">Assurance</span></span>
            </span>
          </template>
          <!-- Suivez : mini-frise achat · entretien · réparation -->
          <template v-else-if="b.key === 'history'">
            <span class="ben__line">
              <span v-for="s in steps" :key="s.year" class="ben__step"><span class="ben__dot"></span><b>{{ s.year }}</b><span class="ben__meta">{{ s.label }}</span></span>
            </span>
          </template>
          <!-- Valorisez : dossier de vente prêt + valeur estimée -->
          <template v-else>
            <span class="ben__ui ben__pack">
              <span class="ben__pack-top"><span class="ben__strong">Dossier de vente</span><span class="vb-badge ben__b">Prêt</span></span>
              <span class="ben__value"><span class="ben__meta">Valeur estimée</span><b>1 250 €</b></span>
            </span>
          </template>
        </div>
        <h3 class="vb-h3">{{ b.title }}</h3>
        <p class="ben__text">{{ b.text }}</p>
      </li>
    </ul>
    <p class="ben__sign">Être prêt avant d’en avoir besoin.</p>
  </div>
</section>
</template>

<script setup lang="ts">
import VbIcon from '../components/VbIcon.vue'

const items = [
  { key: 'search', title: 'Retrouvez vite ce qui compte', text: 'Contrats, garanties, diagnostics au bon endroit.' },
  { key: 'dates', title: 'Anticipez les dates importantes', text: 'Assurances, contrôles et entretiens au bon moment.' },
  { key: 'history', title: 'Suivez l’histoire de vos biens', text: 'Un historique clair qui se construit dans le temps.' },
  { key: 'value', title: 'Valorisez-les le moment venu', text: 'Vente, assurance ou transmission mieux documentées.' },
] as const

const steps = [
  { year: '2021', label: 'Achat' },
  { year: '2024', label: 'Entretien' },
  { year: '2026', label: 'Réparation' },
]
</script>

<style>
.ben__title { font-size: 40px; margin-bottom: 36px; }
.ben__grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; }
.ben__item { display: flex; flex-direction: column; gap: 12px; padding-top: 16px; border-top: 2px solid var(--accent); }

/* Mini-vues (lot 71P) : vignette ivoire de 120 px, éléments d'interface en
   aplats et bordures 1 px, sans ombre ni animation. */
.ben__view {
  position: relative; height: 120px; margin-bottom: 4px; padding: 14px; border-radius: var(--radius-lg); overflow: hidden;
  background: var(--bg-page); border: 1px solid var(--border-subtle);
  display: flex; flex-direction: column; justify-content: center; gap: 10px; color: var(--text-primary);
}
.ben__ui { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); }
.ben__strong { font-size: 13px; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ben__meta { font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ben__col { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.ben__ico { width: 28px; height: 28px; border-radius: 8px; background: var(--accent-soft); color: var(--accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ben__b { font-size: 11px; padding: 2px 8px; flex-shrink: 0; }
/* Retrouvez */
.ben__search { display: flex; align-items: center; gap: 8px; height: 34px; padding: 0 12px; border-radius: var(--radius-pill); border: 1px solid var(--accent); background: var(--bg-card); font-size: 13px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; }
.ben__search .vb-icon { color: var(--accent); flex-shrink: 0; }
.ben__result { display: flex; align-items: center; gap: 10px; padding: 7px 10px; }
/* Anticipez */
.ben__dates { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.ben__due { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 8px; min-width: 0; }
.ben__date { width: 42px; height: 46px; border-radius: 10px; background: var(--accent-soft); color: var(--accent); display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 9.5px; font-weight: 700; letter-spacing: .04em; flex-shrink: 0; }
.ben__date b { font-size: 17px; line-height: 1.05; letter-spacing: 0; }
.ben__date--soon { background: var(--attention-soft); color: var(--attention-on-subtle); }
/* Suivez : frise sur un filet 1 px */
.ben__line { position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); padding-top: 4px; }
.ben__line::before { content: ''; position: absolute; left: 6px; right: 6px; top: 10px; border-top: 1px solid var(--accent); }
.ben__step { position: relative; display: flex; flex-direction: column; gap: 2px; min-width: 0; font-size: 13px; }
.ben__step b { margin-top: 8px; font-size: 15px; font-weight: 800; color: var(--text-primary); }
.ben__dot { width: 13px; height: 13px; border-radius: 50%; background: var(--bg-card); border: 1px solid var(--accent); }
.ben__step:last-child .ben__dot { background: var(--accent); }
/* Valorisez */
.ben__pack { display: flex; flex-direction: column; gap: 8px; padding: 10px 12px; }
.ben__pack-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.ben__value { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; padding-top: 8px; border-top: 1px solid var(--border-subtle); }
.ben__value b { font-size: 20px; font-weight: 800; letter-spacing: -.02em; color: var(--text-primary); }
.ben__text { font-size: 16px; line-height: 1.55; color: var(--text-muted); }
.ben__sign { margin-top: 36px; font-size: 20px; line-height: 1.35; font-weight: 600; letter-spacing: -.01em; color: var(--text-heading); }
@media (max-width: 1024px) and (min-width: 861px) { .ben__grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 860px) {
  .ben__title { font-size: var(--fs-h2-mobile); margin-bottom: 24px; }
  .ben__grid { gap: 20px; }
  .ben__sign { font-size: 18px; margin-top: 28px; }
}
</style>
