<template>
<!-- Bénéfices — bande brume sous le héros (charte 2026 §6, maquette « Bénéfices »).
     Suite directe du héros dans le HTML : H2 puis quatre H3, puis la signature
     (ordre du ticket SEO accueil inchangé). -->
<section class="vb-band ben" aria-labelledby="ben-title">
  <div class="vb-container">
    <h2 id="ben-title" class="vb-h2 ben__title">Centralisez, organisez, valorisez.</h2>
    <ul class="ben__grid r-stack">
      <li v-for="b in items" :key="b.title" class="ben__item">
        <VbIcon :name="b.icon" class="ben__icon" />
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
import type { IconName } from '../components/icons'

const items: Array<{ icon: IconName; title: string; text: string }> = [
  { icon: 'search', title: 'Retrouvez vite ce qui compte', text: 'Contrats, garanties, diagnostics au bon endroit.' },
  { icon: 'calendar', title: 'Anticipez les dates importantes', text: 'Assurances, contrôles et entretiens au bon moment.' },
  { icon: 'file', title: 'Suivez l’histoire de vos biens', text: 'Un historique clair qui se construit dans le temps.' },
  { icon: 'chart', title: 'Valorisez-les le moment venu', text: 'Vente, assurance ou transmission mieux documentées.' },
]
</script>

<style>
.ben__title { font-size: 40px; margin-bottom: 36px; }
.ben__grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; }
.ben__item { display: flex; flex-direction: column; gap: 12px; padding-top: 16px; border-top: 2px solid var(--accent); }
.ben__icon { color: var(--accent); }
.ben__text { font-size: 16px; line-height: 1.55; color: var(--text-muted); }
.ben__sign { margin-top: 36px; font-size: 20px; line-height: 1.35; font-weight: 600; letter-spacing: -.01em; color: var(--text-heading); }
@media (max-width: 1024px) and (min-width: 861px) { .ben__grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 860px) {
  .ben__title { font-size: var(--fs-h2-mobile); margin-bottom: 24px; }
  .ben__grid { gap: 20px; }
  .ben__sign { font-size: 18px; margin-top: 28px; }
}
</style>
