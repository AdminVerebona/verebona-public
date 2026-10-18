<template>
<section id="features" class="vb-section feat">
  <div class="vb-container">
    <div class="feat__intro">
      <span class="vb-eyebrow">Fonctionnalités</span>
      <h2 class="vb-h2 feat__title">Ce que Verebona vous permet de faire.</h2>
      <p class="vb-text">Des bénéfices concrets, pour reprendre le contrôle de ce que vous possédez.</p>
    </div>
    <!-- Illustrations : aperçus schématiques de l'application (point 9.6 de la
         charte : captures réelles à fournir). Décoratives pour les lecteurs d'écran. -->
    <div class="feat__grid">
      <div class="vb-card feat__card">
        <div class="feat__ill" aria-hidden="true">
          <div class="feat__assets">
            <div v-for="a in assets" :key="a.name" class="feat__asset"><img :src="a.img" alt="" /><div><b>{{ a.name }}</b><span class="feat__sub">{{ a.docs }}</span></div></div>
          </div>
        </div>
        <div class="feat__body"><h3 class="vb-h3 feat__h3">Centralisez vos biens</h3><p class="feat__text">Regroupez tous vos biens dans un seul espace structuré, avec photos et informations clés.</p></div>
      </div>

      <div class="vb-card feat__card">
        <div class="feat__ill" aria-hidden="true">
          <div class="feat__tree">
            <span class="feat__chip feat__chip--root"><VbIcon name="home" :size="14" />Appartement Lyon</span>
            <div class="feat__branch">
              <span class="feat__chip"><VbIcon name="file" :size="13" />Bail de location</span>
              <span class="feat__chip"><VbIcon name="file" :size="13" />Attestation assurance</span>
              <span class="feat__chip"><VbIcon name="calendar" :size="13" />Contrôle chaudière · 12 mars</span>
            </div>
          </div>
        </div>
        <div class="feat__body"><h3 class="vb-h3 feat__h3">Reliez documents &amp; infos</h3><p class="feat__text">Associez chaque document, équipement ou événement à un bien pour garder tout le contexte.</p></div>
      </div>

      <div class="vb-card feat__card">
        <div class="feat__ill" aria-hidden="true">
          <div class="feat__cal">
            <div class="feat__cal-head"><b>Mars 2026</b><span>‹ ›</span></div>
            <div class="feat__cal-grid">
              <span v-for="(d, i) in weekDays" :key="'w' + i" class="feat__cal-wd">{{ d }}</span>
              <span v-for="n in 30" :key="n" :class="['feat__cal-d', n === 12 ? 'feat__cal-d--on' : '', dots[n] ? `feat__cal-d--${dots[n]}` : '']">{{ n }}</span>
            </div>
          </div>
        </div>
        <div class="feat__body"><h3 class="vb-h3 feat__h3">L'agenda de vos biens</h3><p class="feat__text">Toutes les dates liées à vos biens réunies dans un agenda unique, alimenté automatiquement.</p></div>
      </div>

      <div class="vb-card feat__card">
        <div class="feat__ill" aria-hidden="true">
          <div class="feat__progress">
            <div class="feat__ring"><span>82%</span></div>
            <div><b>Fiche presque complète</b><span class="feat__sub">1 information à compléter</span></div>
          </div>
          <div class="feat__checks">
            <div><VbIcon name="check" :size="14" class="feat__ok" />Facture d'achat</div>
            <div><VbIcon name="check" :size="14" class="feat__ok" />Photos du bien</div>
            <div class="feat__todo"><span class="feat__todo-dot"></span>Numéro de série</div>
          </div>
        </div>
        <div class="feat__body"><h3 class="vb-h3 feat__h3">Un espace toujours à jour</h3><p class="feat__text">Repérez d'un coup d'œil les fiches incomplètes et complétez-les en quelques secondes.</p></div>
      </div>

      <div class="vb-card feat__card">
        <div class="feat__ill" aria-hidden="true">
          <div class="feat__docs"><span></span><span></span><span></span></div>
          <div class="feat__zip"><VbIcon name="download" :size="15" /><b>Dossier_vente.zip</b><span class="vb-badge">Prêt</span></div>
        </div>
        <div class="feat__body"><h3 class="vb-h3 feat__h3">Un dossier complet en un clic</h3><p class="feat__text">Exportez un dossier structuré — vente, assurance, succession — prêt à partager.</p></div>
      </div>

      <div class="vb-card feat__card">
        <div class="feat__ill" aria-hidden="true">
          <div class="feat__duo">
            <span class="feat__avatars"><span>Lé</span><span>Ma</span></span>
            <div><b>Espace commun</b><span class="feat__sub">Léa &amp; Marc · 2 membres</span></div>
          </div>
          <div class="feat__checks">
            <div class="feat__chip feat__chip--wide">Vélo Cargo <em>· modifié par Marc</em></div>
            <div class="feat__chip feat__chip--wide">Appartement Lyon <em>· ajouté par Léa</em></div>
          </div>
        </div>
        <div class="feat__body"><h3 class="vb-h3 feat__h3">Partagez à deux (Duo)</h3><p class="feat__text">Collaborez avec une autre personne dans un espace commun, sans perdre en organisation.</p></div>
      </div>
    </div>
  </div>
</section>
</template>

<script setup lang="ts">
import VbIcon from '../components/VbIcon.vue'

const assets = [
  { name: 'Appartement', docs: '7 documents', img: '/assets/appartement-lyon.webp' },
  { name: 'Vélo Cargo', docs: '6 documents', img: '/assets/velo-cargo.webp' },
  { name: 'Planche', docs: '3 documents', img: '/assets/surf-personal.webp' },
]
const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
// Repères du mois : échéance à venir (pétrole) et retard (cuivre).
const dots: Record<number, 'due' | 'late'> = { 5: 'due', 18: 'due', 24: 'late' }
</script>

<style>
.feat__intro { max-width: 640px; margin-bottom: 40px; }
.feat__title { margin-bottom: 14px; }
.feat__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.feat__card { display: flex; flex-direction: column; overflow: hidden; }
.feat__ill { margin: 16px 16px 0; border-radius: var(--radius-md); background: var(--accent-soft); padding: 14px; height: 168px; overflow: hidden; display: flex; flex-direction: column; gap: 10px; font-size: 11px; color: var(--text-primary); }
.feat__ill b { font-weight: 700; }
.feat__body { padding: 18px 22px 24px; }
.feat__h3 { margin-bottom: 8px; }
.feat__text { font-size: 15.5px; line-height: 1.6; color: var(--text-muted); }

.feat__assets { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; height: 100%; }
.feat__asset { border-radius: 10px; overflow: hidden; background: var(--bg-card); border: 1px solid var(--border); }
.feat__asset img { display: block; width: 100%; height: 82px; object-fit: cover; }
.feat__asset div { padding: 6px 8px; display: flex; flex-direction: column; }
.feat__sub { color: var(--text-muted); font-size: 10px; }
.feat__tree { display: flex; flex-direction: column; gap: 8px; }
.feat__chip { display: inline-flex; align-items: center; gap: 7px; padding: 6px 10px; border-radius: 8px; background: var(--bg-card); border: 1px solid var(--border); color: var(--text-primary); }
.feat__chip--root { align-self: flex-start; font-weight: 700; border-color: var(--accent); color: var(--accent); }
.feat__chip--wide { display: flex; }
.feat__chip em { font-style: normal; color: var(--text-muted); margin-left: 4px; }
.feat__branch { margin-left: 12px; padding-left: 14px; border-left: 1.5px dashed var(--bubble-edge); display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
.feat__cal { background: var(--bg-card); border-radius: 10px; border: 1px solid var(--border); padding: 8px 10px; height: 100%; }
.feat__cal-head { display: flex; justify-content: space-between; margin-bottom: 4px; color: var(--text-heading); }
.feat__cal-head span { color: var(--text-muted); }
.feat__cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; font-size: 9.5px; text-align: center; }
.feat__cal-wd { font-weight: 700; color: var(--text-muted); }
.feat__cal-d { position: relative; padding: 2px 0; color: var(--text-primary); border-radius: 5px; }
.feat__cal-d--on { background: var(--accent); color: var(--on-accent); font-weight: 700; }
.feat__cal-d--due::after, .feat__cal-d--late::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 3px; height: 3px; border-radius: 50%; background: var(--accent); }
.feat__cal-d--late::after { background: var(--attention); }
.feat__progress, .feat__duo { display: flex; align-items: center; gap: 12px; }
.feat__progress div, .feat__duo div { display: flex; flex-direction: column; }
.feat__ring { width: 52px; height: 52px; border-radius: 50%; border: 5px solid var(--bg-card); border-top-color: var(--accent); border-right-color: var(--accent); border-bottom-color: var(--accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.feat__ring span { font-size: 12px; font-weight: 800; color: var(--text-heading); }
.feat__checks { display: flex; flex-direction: column; gap: 6px; font-size: 11.5px; }
.feat__checks > div:not(.feat__chip) { display: flex; align-items: center; gap: 8px; }
.feat__ok { color: var(--accent); }
.feat__todo { color: var(--attention-on-subtle); font-weight: 600; }
.feat__todo-dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid currentColor; margin: 0 2px; }
.feat__docs { position: relative; height: 64px; }
.feat__docs span { position: absolute; top: 4px; width: 80px; height: 52px; border-radius: 8px; background: var(--bg-card); border: 1px solid var(--border); }
.feat__docs span:nth-child(1) { left: 14px; transform: rotate(-8deg); }
.feat__docs span:nth-child(2) { left: 34px; transform: rotate(5deg); }
.feat__docs span:nth-child(3) { left: 24px; top: 0; border-color: var(--bubble-edge); }
.feat__zip { display: flex; align-items: center; gap: 9px; padding: 8px 11px; border-radius: 10px; background: var(--bg-card); border: 1px solid var(--border); color: var(--accent); }
.feat__zip b { color: var(--text-primary); }
.feat__zip .vb-badge { margin-left: auto; }
.feat__avatars { display: flex; }
.feat__avatars span { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--on-accent); background: var(--accent); border: 2px solid var(--accent-soft); }
.feat__avatars span + span { margin-left: -12px; background: var(--attention); }
@media (max-width: 1024px) { .feat__grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .feat__grid { grid-template-columns: 1fr; } }
</style>
