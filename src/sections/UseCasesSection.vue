<template>
<section id="cas-usage" class="vb-section vb-section--brume uc">
  <div class="vb-container">
    <div class="uc__intro">
      <span class="vb-eyebrow">Cas d'usage</span>
      <h2 class="vb-h2 uc__title">Utile au quotidien. Décisif quand il faut agir.</h2>
      <p class="vb-text">Verebona vous aide à retrouver, suivre et documenter vos biens au fil du temps, puis à réunir les bonnes pièces lorsqu'un événement arrive.</p>
    </div>
    <!-- Types de biens : liste statique (charte : pas de défilement automatique). -->
    <ul class="uc__kinds" aria-label="Exemples de biens">
      <li v-for="k in kinds" :key="k">{{ k }}</li>
    </ul>
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
import { useLanding } from '../composables/useLanding'
import VbIcon from '../components/VbIcon.vue'

const { ucGroups } = useLanding()

const kinds = ['Voiture', 'Appartement', 'Garage', 'Moto', 'Maison', 'Terrain', 'Vélo', 'Local commercial', 'Loisir / Sport', 'Électronique']
</script>

<style>
.uc__intro { max-width: 700px; margin-bottom: 28px; }
.uc__title { margin-bottom: 14px; }
.uc__kinds { list-style: none; margin: 0 0 40px; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.uc__kinds li { padding: 5px 12px; border-radius: var(--radius-pill); border: 1px solid var(--bubble-edge); background: var(--bg-page); font-size: 14px; font-weight: 600; color: var(--text-primary); }
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
  .uc__head { padding: 14px 14px; align-items: flex-start; }
  .uc__panel { padding: 4px 16px 20px; }
}
</style>
